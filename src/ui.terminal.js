/**
 * Created by andreybobrov on 4/2/16.
 */
;(function ($, window, document, undefined) {
    $.widget("ui.terminal", {

        options: {
            inputBasePath: "root@anykeydev:~/projects",
            draggable: false,
            draggableContainer:"",
            commands: []
        },

        _selectors: {},

        _commands: [],

        _commandStack: {
            _arr: [],
            // current position in the arr
            _pointer: 0,
            // add command to stack and reset pointer
            push: function (cmd) {
                // If the command was in the array we should remove it and push back to the stack
                var index = this._arr.indexOf(cmd);
                if (index >= 0) {
                    this._arr.splice(index, 1);
                }

                this._arr.push(cmd);

                this.reset();
            },

            // Get previous command.
            popUp: function () {
                this._pointer--;
                if (this._pointer < this._arr.length && this._pointer >= 0) {
                    var el = this._arr[this._pointer];
                    return el;
                } else {
                    // reset the pointer if command not found
                    this._pointer = 0;
                }
            },
            popDown: function () {
                this._pointer++;
                if (this._pointer < this._arr.length && this._pointer >= 0) {
                    var el = this._arr[this._pointer];
                    return el;
                } else {
                    // reset the pointer if command not found
                    this._pointer = this._arr.length == 0 ? 0 : this._arr.length;
                }
            },
            reset: function () {
                this._pointer = this._arr.length;
            }
        },

        _types: {
            // @name: command name
            // @desc: command help text
            // @trigger: function to be executed when command triggers
            // @props: additional properties that are to be added to the command object
            Command: function (name, trigger, desc, props) {
                this.name = name;
                this.info = desc;
                this.trigger = trigger;
                this.properties = props;
            }
        },

        // HTMLS
        _inputHtml: function () {
            return '<div class="terminal-input-wrap">\
                            <span id="input-text">' + this.options.inputBasePath + ' $</span>\
                            <span class="terminal-input"></span>\
                        </div>'
        },

        _terminalHtml: function () {
            return '<div class="terminal-container transparent">' +
            this.options.draggable ? '<div class="terminal-header"></div>' : '' +
            '<div class="terminal terminal-scrollable sharp-top-border">\
                <div class="terminal-output"></div>\
                <div class="terminal-helper" contenteditable="true"></div>\
            </div>\
        </div>'
        },
        // ./HTMLS

        // HELPERS
        _putCaretToTheEnd: function (el) {
            el.focus();
            var textNode = el.firstChild;

            if (textNode == null || textNode.data == null)
                return;

            var caret = textNode.data.length || 0;
            var range = document.createRange();

            range.setStart(textNode, caret);
            range.setEnd(textNode, caret);

            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        },

        _terminalScrollBottom: function () {
            var $terminal = this._selectors.$terminal;
            $terminal.scrollTop($terminal[0].scrollHeight);
        },

        // Input is re-created each time we submit the data.
        _createNewInput: function () {
            var $output = this._selectors.$output;

            this._selectors.$inputDisplayText.removeClass("terminal-input terminal-input-typing");
            this._selectors.$inputLine.removeClass("terminal-input-wrap");

            this._addToOutput(this._inputHtml());

            // preserve the reference
            this._selectors.$inputLine = $output.find(".terminal-input-wrap");
            this._selectors.$inputDisplayText = $output.find(".terminal-input");
        },

        // Function that we use to output data.
        _addToOutput: function (data) {
            this._selectors.$output.append(data);

            // Scroll down after we are done
            this._terminalScrollBottom();
        },

        // ./HELPERS


        _create: function () {
            var options = this.options;

            this._initDefaultCommands();

            this._addCommands(options.commands);

            this._attachHtmlAndInitSelectors();

            this._delegateEvents();
        },

        _setOption: function (key, value) {
            this.options[key] = value;
        },

        _destroy: function () {
            $.Widget.prototype.destroy.apply(this, arguments);
        },

        _initDefaultCommands: function () {
            var helpCommand = new this._types.Command(
                "help",
                function (terminal, $output, args) {
                    var html = "";
                    for (var command in terminal._commands) {
                        html += "<b>" + terminal._commands[command].name + "</b>: ";
                        html += terminal._commands[command].info;
                        html += "<br />";
                    }
                    return html;
                },
                "Lists available commands");

            var clearCommand = new this._types.Command(
                "clear",
                function (terminal, $output, args) {
                    $output.empty();
                },
                "Clears the output");

            this._commands.push(helpCommand);
            this._commands.push(clearCommand);
        },

        _addCommands: function (cmds) {
            var that = this;
            cmds.forEach(function (cmd) {
                that.addCommand(cmd)
            });
        },

        _attachHtmlAndInitSelectors: function () {
            var el = this.element;
            var selectors = this._selectors;

            // create a container
            var $terminalHtml = $(this._terminalHtml());

            // most used selectors
            selectors.$terminal = $terminalHtml.find(".terminal");
            selectors.$output = $terminalHtml.find(".terminal-output");

            // add inputs to the output
            selectors.$output.append(this._inputHtml());

            selectors.$inputDisplayText = $terminalHtml.find(".terminal-input");
            selectors.$hiddenInput = $terminalHtml.find(".terminal-helper");

            // the whole input line
            selectors.$inputLine = $terminalHtml.find(".terminal-input-wrap");

            if (this.options.draggable) {
                $(".terminal-container").draggable({
                    handle: ".terminal-header",
                    containment: this.options.draggableContainer
                });
            }

            el.html($terminalHtml);
        },

        _delegateEvents: function () {
            var that = this;
            var selectors = this._selectors;

            // This handle is to make sure that clicks on the empty space below the input
            // are redirected to the input itself
            selectors.$terminal.on("click", function (e) {
                // if we clicked on the child element
                if (this != e.target)
                    return;

                selectors.$hiddenInput.focus();

            });

            selectors.$output.on("click", ".terminal-input-wrap", function (e) {
                // To make sure that if we click on an empty space to the right
                // the focus is set on the input itself
                selectors.$hiddenInput.focus();
            });

            // Redirect focus to the hidden input
            selectors.$inputDisplayText.on("focus", function (e) {
                selectors.$hiddenInput.focus();
            });

            selectors.$hiddenInput.on("focus", function (e) {
                // To make sure that we see the input line
                that._terminalScrollBottom();
                that._putCaretToTheEnd(selectors.$hiddenInput.get(0));

                selectors.$inputDisplayText.addClass("terminal-input-typing");
            });

            selectors.$hiddenInput.on("blur", function (e) {
                // Removing the fake caret from input to indicate that we are not focused
                selectors.$inputDisplayText.removeClass("terminal-input-typing");
            });

            // We should copy the input value to the display text to inform user that his typings are reflected:)
            selectors.$hiddenInput.on("input", function (e) {
                selectors.$inputDisplayText.text(selectors.$hiddenInput.text());
            });

            selectors.$hiddenInput.on("keypress", function (e) {
                var keycode = e.keyCode || e.which;

                // The ENTER key
                if (keycode == 13) {

                    // To make sure the input is not fulfilled with empty div
                    e.preventDefault();

                    var commandText = selectors.$inputDisplayText.text();

                    // In no text
                    if (commandText.trim() == "")
                        return;

                    selectors.$inputDisplayText.text(selectors.$hiddenInput.text());
                    // Pushing command to the stack for preserving history
                    that._commandStack.push(commandText);
                    // Getting command name and arguments
                    var spaceIndex = commandText.indexOf(' ');
                    var commandName = spaceIndex == -1 ? commandText : commandText.substring(0, spaceIndex);
                    var commandArgs = spaceIndex == -1 ? null : commandText.substr(spaceIndex + 1);

                    // If command is in the list
                    var command = $.grep(that._commands, function (x) {
                        return x.name == commandName;
                    })[0];

                    if (command) {
                        that._addToOutput(command.trigger(that, that._selectors.$output, commandArgs));
                        that._createNewInput();
                    } else {
                        that._addToOutput("<span>Command <b>" + commandName + "</b> not found</span><br/>");
                        that._addToOutput("<span> Type <b>help</b> to list all available commands </span> <br/>");
                        that._createNewInput();
                    }

                    // Clear all the inputs
                    selectors.$hiddenInput.empty();
                    selectors.$inputDisplayText.empty();

                    // Just in case browser has added some empty html when we cleared texts
                    selectors.$hiddenInput.children().each(function (child) {
                        $(child).remove();
                    });

                    // Focusing back to the input
                    selectors.$hiddenInput.focus();
                }

            });

            selectors.$hiddenInput.on("keydown", function (e) {
                var keycode = e.keyCode || e.which;

                // Right/Left arrow keys. To make sure we dont move the caret
                if (keycode == 37 || keycode == 39) {
                    e.preventDefault();
                    return false;
                }

                // Up/Down Arrow keys
                if (keycode == 38 || keycode == 40) {
                    var cmd;
                    // The Up arrow key
                    if (keycode == 38) {
                        cmd = that._commandStack.popUp();
                    }
                    // The Down arrow key
                    if (keycode == 40) {
                        cmd = that._commandStack.popDown();
                        //in case no commands left below this one - blank the input
                        if (cmd === void 0) {
                            selectors.$hiddenInput.empty();
                            selectors.$inputDisplayText.empty();
                        }
                    }

                    // If command has been found, set the texts
                    if (cmd) {
                        selectors.$inputDisplayText.text(cmd);
                        selectors.$hiddenInput.text(cmd);
                    }
                }
            });

            selectors.$hiddenInput.on("keyup", function (e) {
                var keycode = e.keyCode || e.which;
                // The KEYDOWN event is fired before input is fulfilled.
                // That is why we should put caret to its initial place.
                if (keycode == 38 || keycode == 40) {
                    that._putCaretToTheEnd(selectors.$hiddenInput.get(0));
                }
            });
        },

        // @args.name: command name
        // @args.desc: command help text
        // @args.trigger: function to be executed when command triggers
        // @args.props: additional properties that are to be added to the command object
        addCommand: function (args) {
            var name = args.name;
            if (!name) {
                console.error("ui.terminal error: Cannot add a command without name");
                return;
            }

            var trigger = args.trigger;
            if (!trigger) {
                console.error("ui.terminal error: Cannot add a command without trigger function")
            }

            var desc = args.desc || "";
            var opts = args.props || "";

            var command = new this._types.Command(name, trigger, desc, opts);
        }
    });

})($, window, document);