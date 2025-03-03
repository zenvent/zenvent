---
layout: post
title: "Parameteric Automation"
excerpt: "Automated Designs with Fusion 360"
tags: [random]
image: "images/automatedpots/fusion_360_bodies.png"
---

I created a model in fusion 360 that is fully parameterized.

I did this mainly for testing different settings easily, but in the end I wanted to generate multiple varients of the 'self-watering' planter to sell. I needed a way to quickly export the all the models, in all possible sizes. In this case I wrote a script that iterates through the existing bodies in a project, exports them as stl, then applys a parameter update and repeats. It even skips parts that are constant. See the code for more details.

Once I've generated all the stl files, I loaded them into one Bambu Studio project (or Orca Slicer etc). Now I can easilly check the box of the compoents I want and print, and all settings will carry over to each part as ordered.


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