# ui.terminal

## Description
Jquery UI Terminal Widget
Allows you to add custom commands on top of standard *help* and *clear* commands.

Can be draggable as well.

## Example usage
Add a container to your webpage:
```
<div id="test-container"></div>
```
And init the widget:
```
<script>
    $(document).ready(function() {
        $("#test-container").terminal({inputBasePath: "me@my_comp"});
    });
</script>
```
This will result in creating a new terminal window attached to the given container. 

The input path will be: `me@my_comp: $`

##Options 
###Commands

You can add different custom commands to your terminal, e.g:
```
var commands = [{ name:"test_cmd", 
                  trigger: function(terminal, $output, args) { 
                               return args;
                           }, 
                  desc:"Prints text",
                  properties:{ }}]
                  
$("#test-container").terminal({commands: commands});
```

This command will simply print text. 

If we call `me@my_comp: $ test_cmd some text i want to print`

We will see `some text i want to print` in the output window.

**Parameter details**: 

`name`: Name of your command. If user posts this text to the bash, the **trigger** function will be called.


`trigger`: A callback function, which will be called. 
  
  If a string is *returned* from the `trigger` function, it will be automatically appended to the output window
  
  The following stuff is passed to the parameters:
    
  - `terminal`: this terminal instance;
  
  - `$output`: jquery reference to the output window
  
  - `args`: command args. For example, if user types `cmd -xyz -ttt`, the args will contain `"-xyz -ttt"` string.
  

`[desc]`: Description of your command. This text and commands name will appear if user types `help`
  

`[properties]`: Property object. You can pass any object that you need and then re-use it in the trigger function. 


###Draggable

You can pass a draggable option if you want your terminal widow to be movable
```
$("#test-container").terminal({draggable: true});
```

###DraggableContainer

Also you might want to add a container to make sure that user can't drag the terminal beyond some boundaries:
```
$("#test-container").terminal({draggable: true, draggableContainer: "#term-draggable-container"});
```
