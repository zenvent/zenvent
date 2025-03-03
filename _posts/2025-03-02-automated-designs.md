---
layout: post
title: "Parameteric Automation"
excerpt: "Automated Designs with Fusion 360"
tags: [random]
image: "images/automatedpots/fusion_360_bodies.png"
---
![the bodies](/images/automatedpots/fusion_360_bodies.png)

I built a fully parameterized model in Fusion 360 for a self-watering planter. Originally, I did it to fiddle with different settings easily, but by the end, I saw it as a way to pump out multiple versions to sell. The challenge was generating all the possible size variants without losing my mind. So, I wrote a script that loops through the bodies in the project, exports each one as an STL, updates the parameters, and repeats. It’s clever enough to skip the constant parts—no point in re-exporting what doesn’t change. Want the details? Check out the code below.

![the parameters](/images/automatedpots/fusion_360_parameters.png)

Once I had all the STL files, I loaded them into a single Bambu Studio project (Orca Slicer works too—both are solid options). From there, it’s just checking boxes for the components I want to print. All my settings carry over to each part, no hassle, and I’m ready to hit print.

![bambu studio](/images/automatedpots/bambu_planter_project.png)

Fusion 360 script (Python-based, naturally— Autodesk’s got docs on that if you’re new to it). Tweak it for your own projects if you’re into parametric designs:
![save script here](/images/automatedpots/fusion_360_script.png)

```python
import adsk.core, adsk.fusion, traceback
import os

def run(context):
    try:
        # Get the Fusion 360 application and UI
        app = adsk.core.Application.get()
        ui = app.userInterface
        
        # Get the active design
        design = adsk.fusion.Design.cast(app.activeProduct)
        if not design:
            ui.messageBox('No active design found. Please open your design.', 'Error')
            return
        
        # Get the root component and its bodies
        rootComp = design.rootComponent
        bodies = rootComp.bRepBodies
        
        # Get the "width" parameter
        width_param = design.userParameters.itemByName('width')
        if not width_param:
            ui.messageBox('Parameter "width" not found in the design.', 'Error')
            return
        
        # Define the export directory (adjust this path as needed)
        base_path = "C:/STL_Exports"  # Example path, change to your preferred location
        os.makedirs(base_path, exist_ok=True)  # Create directory if it doesn’t exist
        
        # Define the width values (e.g., 120, 140, 160, 180, 200 mm)
        width_values = [120, 140, 160, 180, 200, 220]  # Customize this list as needed
        
        # Get the export manager
        exportMgr = design.exportManager
        
        # Step 1: Export fixed-size lid and tab once
        fixed_bodies = [body for body in bodies if body.name in ['lid', 'tab']]
        for body in fixed_bodies:
            filename = os.path.join(base_path, f"{body.name}.stl")
            stlOptions = exportMgr.createSTLExportOptions(body, filename)
            exportMgr.execute(stlOptions)
            app.log(f"Exported {body.name} to {filename}")
        
        # Step 2: Export planters with incrementing widths
        planter_bodies = [body for body in bodies if body.name in ['planter_spiral', 'planter_chain', 'planter_plain', 'tray']]
        for width_value in width_values:
            # Update the width parameter
            width_param.expression = f"{width_value} mm"
            app.log(f"Setting width to {width_value} mm")
            
            # Export each planter for the current width
            for body in planter_bodies:
                filename = os.path.join(base_path, f"{body.name}_{width_value}mm.stl")
                stlOptions = exportMgr.createSTLExportOptions(body, filename)
                exportMgr.execute(stlOptions)
                app.log(f"Exported {body.name} to {filename}")
        
        # Notify user of completion
        ui.messageBox('Export complete: Lid, tab, and planters exported as STL files.', 'Success')
    
    except:
        # Handle errors
        if ui:
            ui.messageBox('Script failed:\n{}'.format(traceback.format_exc()), 'Error')

# Required boilerplate for Fusion 360 scripts
def stop(context):
    pass
```

- **Fusion 360**: If you’re not already using it, it’s a beast for parametric modeling. Autodesk’s got a free tier for hobbyists—check it out [here](https://www.autodesk.com/products/fusion-360/overview).
- **Bambu Studio**: My go-to slicer for this. It’s built for Bambu Lab printers but plays nice with others too. Grab it [here](https://bambulab.com/en/download/studio).
- **Orca Slicer**: A fork of Bambu Studio with extra tweaks—more printer profiles and calibration options. Find it on GitHub [here](https://github.com/SoftFever/OrcaSlicer).