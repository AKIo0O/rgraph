    /**
    * o------------------------------------------------------------------------------o
    * | This file is part of the RGraph package - you can learn more at:             |
    * |                                                                              |
    * |                          http://www.rgraph.net                               |
    * |                                                                              |
    * | This package is licensed under the RGraph license. For all kinds of business |
    * | purposes there is a small one-time licensing fee to pay and for non          |
    * | commercial  purposes it is free to use. You can read the full license here:  |
    * |                                                                              |
    * |                      http://www.rgraph.net/LICENSE.txt                       |
    * o------------------------------------------------------------------------------o
    */
    
    if (typeof(RGraph) == 'undefined') RGraph = {};

    /**
    * The bi-polar/age frequency constructor.
    * 
    * @param string id The id of the canvas
    * @param array  left  The left set of data points
    * @param array  right The right set of data points
    */
    RGraph.Bipolar = function (id, left, right)
    {
        // Get the canvas and context objects
        this.id                = id;
        this.canvas            = document.getElementById(id);
        this.context           = this.canvas.getContext('2d');
        this.canvas.__object__ = this;
        this.type              = 'bipolar';
        this.coords            = [];
        this.max               = 0;
        this.isRGraph          = true;


        /**
        * Compatibility with older browsers
        */
        RGraph.OldBrowserCompat(this.context);

        
        // The left and right data respectively
        this.left       = left;
        this.right      = right;
        this.data       = [left, right];

        this.properties = {
            'chart.margin':                 2,
            'chart.xtickinterval':          null,
            'chart.labels':                 [],
            'chart.text.size':              10,
            'chart.text.color':             'black',
            'chart.text.font':              'Verdana',
            'chart.title.left':             '',
            'chart.title.right':            '',
            'chart.gutter.center':          60,
            'chart.gutter.left':            25,
            'chart.gutter.right':           25,
            'chart.gutter.top':             25,
            'chart.gutter.bottom':          25,
            'chart.title':                  '',
            'chart.title.background':       null,
            'chart.title.hpos':             null,
            'chart.title.vpos':             null,
            'chart.title.bold':             true,
            'chart.title.font':             null,
            'chart.colors':                 ['#0f0'],
            'chart.contextmenu':            null,
            'chart.tooltips':               null,
            'chart.tooltips.effect':         'fade',
            'chart.tooltips.css.class':      'RGraph_tooltip',
            'chart.tooltips.highlight':     true,
            'chart.highlight.stroke':       'black',
            'chart.highlight.fill':         'rgba(255,255,255,0.5)',
            'chart.units.pre':              '',
            'chart.units.post':             '',
            'chart.shadow':                 false,
            'chart.shadow.color':           '#666',
            'chart.shadow.offsetx':         3,
            'chart.shadow.offsety':         3,
            'chart.shadow.blur':            3,
            'chart.annotatable':            false,
            'chart.annotate.color':         'black',
            'chart.xmax':                   null,
            'chart.scale.decimals':         null,
            'chart.scale.point':            '.',
            'chart.scale.thousand':         ',',
            'chart.axis.color':             'black',
            'chart.zoom.factor':            1.5,
            'chart.zoom.fade.in':           true,
            'chart.zoom.fade.out':          true,
            'chart.zoom.hdir':              'right',
            'chart.zoom.vdir':              'down',
            'chart.zoom.frames':            25,
            'chart.zoom.delay':             16.666,
            'chart.zoom.shadow':            true,
            'chart.zoom.mode':              'canvas',
            'chart.zoom.thumbnail.width':   75,
            'chart.zoom.thumbnail.height':  75,
            'chart.zoom.background':        true,
            'chart.zoom.action':            'zoom',
            'chart.resizable':              false,
            'chart.resize.handle.adjust':   [0,0],
            'chart.resize.handle.background': null,
            'chart.strokestyle':            '#333'
        }

        // Pad the arrays so they're the same size
        while (this.left.length < this.right.length) this.left.push(0);
        while (this.left.length > this.right.length) this.right.push(0);
    }


    /**
    * The setter
    * 
    * @param name  string The name of the parameter to set
    * @param value mixed  The value of the paraneter 
    */
    RGraph.Bipolar.prototype.Set = function (name, value)
    {
        this.properties[name.toLowerCase()] = value;
    }


    /**
    * The getter
    * 
    * @param name string The name of the parameter to get
    */
    RGraph.Bipolar.prototype.Get = function (name)
    {
        return this.properties[name.toLowerCase()];
    }

    
    /**
    * Draws the graph
    */
    RGraph.Bipolar.prototype.Draw = function ()
    {
        /**
        * Fire the onbeforedraw event
        */
        RGraph.FireCustomEvent(this, 'onbeforedraw');


        /**
        * Clear all of this canvases event handlers (the ones installed by RGraph)
        */
        RGraph.ClearEventListeners(this.id);
        
        /**
        * This is new in May 2011 and facilitates indiviual gutter settings,
        * eg chart.gutter.left
        */
        this.gutterLeft   = this.Get('chart.gutter.left');
        this.gutterRight  = this.Get('chart.gutter.right');
        this.gutterTop    = this.Get('chart.gutter.top');
        this.gutterBottom = this.Get('chart.gutter.bottom');
        


        // Reset the data to what was initially supplied
        this.left  = this.data[0];
        this.right = this.data[1];


        /**
        * Reset the coords array
        */
        this.coords = [];

        this.GetMax();
        this.DrawAxes();
        this.DrawTicks();
        this.DrawLeftBars();
        this.DrawRightBars();

        if (this.Get('chart.axis.color') != 'black') {
            this.DrawAxes(); // Draw the axes again (if the axes color is not black)
        }

        this.DrawLabels();
        this.DrawTitles();
        
        /**
        * Setup the context menu if required
        */
        if (this.Get('chart.contextmenu')) {
            RGraph.ShowContext(this);
        }


        /**
        * Install the on* event handlers
        */
        if (this.Get('chart.tooltips')) {


            // Register the object so that it gets redrawn
            RGraph.Register(this);


            /**
            * Install the window onclick handler
            */
            
            /**
            * Install the window event handler
            */
            var eventHandler_window_click = function ()
            {
                RGraph.Redraw();
            }
            window.addEventListener('click', eventHandler_window_click, false);
            RGraph.AddEventListener('window_' + this.id, 'click', eventHandler_window_click);



            /**
            * If the cursor is over a hotspot, change the cursor to a hand
            */
            var eventHandler_canvas_mousemove = function (e)
            {
                e = RGraph.FixEventObject(e);

                var canvas = document.getElementById(this.id);
                var obj = canvas.__object__;

                /**
                * Get the mouse X/Y coordinates
                */
                var mouseCoords = RGraph.getMouseXY(e);
                var bar         = obj.getBar(e);

                /**
                * Loop through the bars determining if the mouse is over a bar
                */
                for (var i=0; i<obj.coords.length; i++) {

                    var mouseX = mouseCoords[0];  // In relation to the canvas
                    var mouseY = mouseCoords[1];  // In relation to the canvas
                    var left   = obj.coords[i][0];
                    var top    = obj.coords[i][1];
                    var width  = obj.coords[i][2];
                    var height = obj.coords[i][3];

                    if (mouseX >= left && mouseX <= (left + width ) && mouseY >= top && mouseY <= (top + height) ) {
                        /**
                        * Get the tooltip text
                        */
                        if (typeof(obj.Get('chart.tooltips')) == 'function') {
                            var text = obj.Get('chart.tooltips')(i);

                        } else if (typeof(obj.Get('chart.tooltips')) == 'object' && typeof(obj.Get('chart.tooltips')[i]) == 'function') {
                            var text = obj.Get('chart.tooltips')[i](i);
                        
                        } else if (typeof(obj.Get('chart.tooltips')) == 'object') {
                            var text = obj.Get('chart.tooltips')[i];

                        } else {
                            var text = '';
                        }
                        
                        if (text) {
                            canvas.style.cursor = 'pointer';
                        }
                        return;
                    }
                }
                    
                canvas.style.cursor = 'default';
            }
            this.canvas.addEventListener('mousemove', eventHandler_canvas_mousemove, false);
            RGraph.AddEventListener(this.id, 'mouseover', eventHandler_canvas_mousemove);


            /**
            * Install the onclick event handler for the tooltips
            */
            var eventHandler_canvas_click = function (e)
            {
                e = RGraph.FixEventObject(e);

                var canvas = document.getElementById(this.id)
                var obj = canvas.__object__;

                /**
                * Redraw the graph first, in effect resetting the graph to as it was when it was first drawn
                * This "deselects" any already selected bar
                */
                RGraph.Clear(canvas);
                obj.Draw();
    
                /**
                * Get the mouse X/Y coordinates
                */
                var mouseCoords = RGraph.getMouseXY(e);
                var bar         = obj.getBar(e);

                /**
                * This bit shows the tooltip (if required)
                */
                if (bar) {

                    var mouseX = mouseCoords[0];  // In relation to the canvas
                    var mouseY = mouseCoords[1];  // In relation to the canvas
                    var left   = bar[0];
                    var top    = bar[1];
                    var width  = bar[2];
                    var height = bar[3];
                    var index  = bar[4];

                    /**
                    * Show a tooltip if it's defined
                    */
                    if (obj.Get('chart.tooltips')) {

                        /**
                        * Get the tooltip text
                        */
                        if (typeof(obj.Get('chart.tooltips')) == 'function') {
                            var text = obj.Get('chart.tooltips')(index);

                        } else if (typeof(obj.Get('chart.tooltips')) == 'object' && typeof(obj.Get('chart.tooltips')[index]) == 'function') {
                            var text = obj.Get('chart.tooltips')[index](index);
                        
                        } else if (typeof(obj.Get('chart.tooltips')) == 'object') {
                            var text = obj.Get('chart.tooltips')[index];

                        } else {
                            var text = '';
                        }
                        
                        // Only now show a tooltip if one has been set
                        if (text) {
                            obj.context.beginPath();
                                obj.context.strokeStyle = obj.Get('chart.highlight.stroke');
                                obj.context.fillStyle   = obj.Get('chart.highlight.fill');
                                obj.context.strokeRect(left, top, width, height);
                                obj.context.fillRect(left, top, width, height);
                            obj.context.stroke();
                            obj.context.fill();

                            RGraph.Tooltip(canvas, text, e.pageX, e.pageY, index);
                        }
                    }
                }

                /**
                * Stop the event bubbling
                */
                e.stopPropagation();
                
                return false;
            }
            this.canvas.addEventListener('click', eventHandler_canvas_click, false);
            RGraph.AddEventListener(this.id, 'click', eventHandler_canvas_click);

            // This resets the bipolar graph
            if (RGraph.Registry.Get('chart.tooltip')) {
                RGraph.Registry.Get('chart.tooltip').style.display = 'none';
                RGraph.Registry.Set('chart.tooltip', null)
            }
        }
        
        /**
        * If the canvas is annotatable, do install the event handlers
        */
        if (this.Get('chart.annotatable')) {
            RGraph.Annotate(this);
        }
        
        /**
        * This bit shows the mini zoom window if requested
        */
        if (this.Get('chart.zoom.mode') == 'thumbnail' || this.Get('chart.zoom.mode') == 'area') {
            RGraph.ShowZoomWindow(this);
        }

        
        /**
        * This function enables resizing
        */
        if (this.Get('chart.resizable')) {
            RGraph.AllowResizing(this);
        }
        
        /**
        * Add the common .getShape() method
        */
        this.getShape = this.getBar;
        
        /**
        * Fire the RGraph ondraw event
        */
        RGraph.FireCustomEvent(this, 'ondraw');
    }


    /**
    * Draws the axes
    */
    RGraph.Bipolar.prototype.DrawAxes = function ()
    {
        // Draw the left set of axes
        this.context.beginPath();
        this.context.strokeStyle = this.Get('chart.axis.color');

        this.axisWidth  = (RGraph.GetWidth(this) - this.Get('chart.gutter.center') - this.gutterLeft - this.gutterRight) / 2;
        this.axisHeight = RGraph.GetHeight(this) - this.gutterTop - this.gutterBottom;

        this.context.moveTo(this.gutterLeft, RGraph.GetHeight(this) - this.gutterBottom);
        this.context.lineTo(this.gutterLeft + this.axisWidth, RGraph.GetHeight(this) - this.gutterBottom);
        this.context.lineTo(this.gutterLeft + this.axisWidth, this.gutterTop);
        
        this.context.stroke();

        // Draw the right set of axes
        this.context.beginPath();

        var x = this.gutterLeft + this.axisWidth + this.Get('chart.gutter.center');
        
        this.context.moveTo(x, this.gutterTop);
        this.context.lineTo(x, RGraph.GetHeight(this) - this.gutterBottom);
        this.context.lineTo(RGraph.GetWidth(this) - this.gutterRight, RGraph.GetHeight(this) - this.gutterBottom);

        this.context.stroke();
    }


    /**
    * Draws the tick marks on the axes
    */
    RGraph.Bipolar.prototype.DrawTicks = function ()
    {
        var numDataPoints = this.left.length;
        var barHeight     = ( (RGraph.GetHeight(this) - this.gutterTop - this.gutterBottom)- (this.left.length * (this.Get('chart.margin') * 2) )) / numDataPoints;
        
        // Draw the left Y tick marks
        for (var i = RGraph.GetHeight(this) - this.gutterBottom; i >= this.gutterTop; i -= (barHeight + ( this.Get('chart.margin') * 2)) ) {
            if (i < (RGraph.GetHeight(this) - this.gutterBottom) ) {
                this.context.beginPath();
                this.context.moveTo(this.gutterLeft + this.axisWidth, i);
                this.context.lineTo(this.gutterLeft + this.axisWidth + 3, i);
                this.context.stroke();
            }
        }

        //Draw the right axis Y tick marks
        for (var i = RGraph.GetHeight(this) - this.gutterBottom; i >= this.gutterTop; i -= (barHeight + ( this.Get('chart.margin') * 2)) ) {
            if (i < (RGraph.GetHeight(this) - this.gutterBottom) ) {
                this.context.beginPath();
                this.context.moveTo(this.gutterLeft + this.axisWidth + this.Get('chart.gutter.center'), i);
                this.context.lineTo(this.gutterLeft + this.axisWidth + this.Get('chart.gutter.center') - 3, i);
                this.context.stroke();
            }
        }
        
        var xInterval = this.axisWidth / 10;

        // Is chart.xtickinterval specified ? If so, use that.
        if (typeof(this.Get('chart.xtickinterval')) == 'number') {
            xInterval = this.Get('chart.xtickinterval');
        }

        
        // Draw the left sides X tick marks
        for (i=this.gutterLeft; i<(this.gutterLeft + this.axisWidth); i+=xInterval) {
            this.context.beginPath();
            this.context.moveTo(i, RGraph.GetHeight(this) - this.gutterBottom);
            this.context.lineTo(i, (RGraph.GetHeight(this) - this.gutterBottom) + 4);
            this.context.closePath();
            
            this.context.stroke();
        }

        // Draw the right sides X tick marks
        var stoppingPoint = RGraph.GetWidth(this) - this.gutterRight;

        for (i=(this.gutterLeft + this.axisWidth + this.Get('chart.gutter.center') + xInterval); i<=stoppingPoint; i+=xInterval) {
            this.context.beginPath();
                this.context.moveTo(i, RGraph.GetHeight(this) - this.gutterBottom);
                this.context.lineTo(i, (RGraph.GetHeight(this) - this.gutterBottom) + 4);
            this.context.closePath();
            
            this.context.stroke();
        }
        
        // Store this for later
        this.barHeight = barHeight;
    }


    /**
    * Figures out the maximum value, or if defined, uses xmax
    */
    RGraph.Bipolar.prototype.GetMax = function()
    {
        var max = 0;
        var dec = this.Get('chart.scale.decimals');
        
        // chart.xmax defined
        if (this.Get('chart.xmax')) {

            max = this.Get('chart.xmax');
            
            this.scale    = [];
            this.scale[0] = Number((max / 5) * 1).toFixed(dec);
            this.scale[1] = Number((max / 5) * 2).toFixed(dec);
            this.scale[2] = Number((max / 5) * 3).toFixed(dec);
            this.scale[3] = Number((max / 5) * 4).toFixed(dec);
            this.scale[4] = Number(max).toFixed(dec);

            this.max = max;
            

        // Generate the scale ourselves
        } else {
            this.leftmax  = RGraph.array_max(this.left);
            this.rightmax = RGraph.array_max(this.right);
            max = Math.max(this.leftmax, this.rightmax);

            this.scale    = RGraph.getScale(max, this);
            this.scale[0] = Number(this.scale[0]).toFixed(dec);
            this.scale[1] = Number(this.scale[1]).toFixed(dec);
            this.scale[2] = Number(this.scale[2]).toFixed(dec);
            this.scale[3] = Number(this.scale[3]).toFixed(dec);
            this.scale[4] = Number(this.scale[4]).toFixed(dec);

            this.max = this.scale[4];
        }

        // Don't need to return it as it is stored in this.max
    }


    /**
    * Function to draw the left hand bars
    */
    RGraph.Bipolar.prototype.DrawLeftBars = function ()
    {
        // Set the stroke colour
        this.context.strokeStyle = this.Get('chart.strokestyle');

        for (i=0; i<this.left.length; ++i) {
            
            /**
            * Turn on a shadow if requested
            */
            if (this.Get('chart.shadow')) {
                this.context.shadowColor   = this.Get('chart.shadow.color');
                this.context.shadowBlur    = this.Get('chart.shadow.blur');
                this.context.shadowOffsetX = this.Get('chart.shadow.offsetx');
                this.context.shadowOffsetY = this.Get('chart.shadow.offsety');
            }

            this.context.beginPath();

                // Set the colour
                if (this.Get('chart.colors')[i]) {
                    this.context.fillStyle = this.Get('chart.colors')[i];
                }
                
                /**
                * Work out the coordinates
                */
                var width = ( (this.left[i] / this.max) *  this.axisWidth);
                var coords = [
                              this.gutterLeft + this.axisWidth - width,
                              this.gutterTop + (i * ( this.axisHeight / this.left.length)) + this.Get('chart.margin'),
                              width,
                              this.barHeight
                             ];

                // Draw the IE shadow if necessary
                if (RGraph.isIE8() && this.Get('chart.shadow')) {
                    this.DrawIEShadow(coords);
                }
    
                
                this.context.strokeRect(coords[0], coords[1], coords[2], coords[3]);
                this.context.fillRect(coords[0], coords[1], coords[2], coords[3]);

            this.context.stroke();
            this.context.fill();

            /**
            * Add the coordinates to the coords array
            */
            this.coords.push([
                              coords[0],
                              coords[1],
                              coords[2],
                              coords[3]
                             ]);
        }

        /**
        * Turn off any shadow
        */
        RGraph.NoShadow(this);
    }


    /**
    * Function to draw the right hand bars
    */
    RGraph.Bipolar.prototype.DrawRightBars = function ()
    {
        // Set the stroke colour
        this.context.strokeStyle = this.Get('chart.strokestyle');
            
        /**
        * Turn on a shadow if requested
        */
        if (this.Get('chart.shadow')) {
            this.context.shadowColor   = this.Get('chart.shadow.color');
            this.context.shadowBlur    = this.Get('chart.shadow.blur');
            this.context.shadowOffsetX = this.Get('chart.shadow.offsetx');
            this.context.shadowOffsetY = this.Get('chart.shadow.offsety');
        }

        for (var i=0; i<this.right.length; ++i) {
            this.context.beginPath();

            // Set the colour
            if (this.Get('chart.colors')[i]) {
                this.context.fillStyle = this.Get('chart.colors')[i];
            }


            var width = ( (this.right[i] / this.max) * this.axisWidth);
            var coords = [
                          this.gutterLeft + this.axisWidth + this.Get('chart.gutter.center'),
                          this.Get('chart.margin') + (i * (this.axisHeight / this.right.length)) + this.gutterTop,
                          width,
                          this.barHeight
                        ];

                // Draw the IE shadow if necessary
                if (RGraph.isIE8() && this.Get('chart.shadow')) {
                    this.DrawIEShadow(coords);
                }
            this.context.strokeRect(coords[0], coords[1], coords[2], coords[3]);
            this.context.fillRect(coords[0], coords[1], coords[2], coords[3]);

            this.context.closePath();
            
            /**
            * Add the coordinates to the coords array
            */
            this.coords.push([
                              coords[0],
                              coords[1],
                              coords[2],
                              coords[3]
                             ]);
        }
        
        this.context.stroke();

        /**
        * Turn off any shadow
        */
        RGraph.NoShadow(this);
    }


    /**
    * Draws the titles
    */
    RGraph.Bipolar.prototype.DrawLabels = function ()
    {
        this.context.fillStyle = this.Get('chart.text.color');

        var labelPoints = new Array();
        var font = this.Get('chart.text.font');
        var size = this.Get('chart.text.size');
        
        var max = Math.max(this.left.length, this.right.length);
        
        for (i=0; i<max; ++i) {
            var barAreaHeight = RGraph.GetHeight(this) - this.gutterTop - this.gutterBottom;
            var barHeight     = barAreaHeight / this.left.length;
            var yPos          = (i * barAreaHeight) + this.gutterTop;

            labelPoints.push(this.gutterTop + (i * barHeight) + (barHeight / 2) + 5);
        }

        for (i=0; i<labelPoints.length; ++i) {
            RGraph.Text(this.context,
                        this.Get('chart.text.font'),
                        this.Get('chart.text.size'),
                        this.gutterLeft + this.axisWidth + (this.Get('chart.gutter.center') / 2),
                        labelPoints[i],
                        String(this.Get('chart.labels')[i] ? this.Get('chart.labels')[i] : ''),
                        null,
                        'center');
        }

        // Now draw the X labels for the left hand side
        RGraph.Text(this.context,font,size,this.gutterLeft,RGraph.GetHeight(this) - this.gutterBottom + 14,RGraph.number_format(this, this.scale[4], this.Get('chart.units.pre'), this.Get('chart.units.post')),null,'center');
        RGraph.Text(this.context, font, size, this.gutterLeft + ((RGraph.GetWidth(this) - this.Get('chart.gutter.center') - this.gutterLeft - this.gutterRight) / 2) * (1/5), RGraph.GetHeight(this) - this.gutterBottom + 14, RGraph.number_format(this, this.scale[3], this.Get('chart.units.pre'), this.Get('chart.units.post')), null, 'center');
        RGraph.Text(this.context, font, size, this.gutterLeft + ((RGraph.GetWidth(this) - this.Get('chart.gutter.center') - this.gutterLeft - this.gutterRight) / 2) * (2/5), RGraph.GetHeight(this) - this.gutterBottom + 14, RGraph.number_format(this, this.scale[2], this.Get('chart.units.pre'), this.Get('chart.units.post')), null, 'center');
        RGraph.Text(this.context, font, size, this.gutterLeft + ((RGraph.GetWidth(this) - this.Get('chart.gutter.center') - this.gutterLeft - this.gutterRight) / 2) * (3/5), RGraph.GetHeight(this) - this.gutterBottom + 14, RGraph.number_format(this, this.scale[1], this.Get('chart.units.pre'), this.Get('chart.units.post')), null, 'center');
        RGraph.Text(this.context, font, size, this.gutterLeft + ((RGraph.GetWidth(this) - this.Get('chart.gutter.center') - this.gutterLeft - this.gutterRight) / 2) * (4/5), RGraph.GetHeight(this) - this.gutterBottom + 14, RGraph.number_format(this, this.scale[0], this.Get('chart.units.pre'), this.Get('chart.units.post')), null, 'center');

        // Now draw the X labels for the right hand side
        RGraph.Text(this.context, font, size, RGraph.GetWidth(this) - this.gutterRight, RGraph.GetHeight(this) - this.gutterBottom + 14, RGraph.number_format(this, this.scale[4], this.Get('chart.units.pre'), this.Get('chart.units.post')), null, 'center');
        RGraph.Text(this.context, font, size, RGraph.GetWidth(this) - this.gutterRight - (this.axisWidth * 0.2), RGraph.GetHeight(this) - this.gutterBottom + 14,RGraph.number_format(this, this.scale[3], this.Get('chart.units.pre'), this.Get('chart.units.post')), null, 'center');
        RGraph.Text(this.context, font, size, RGraph.GetWidth(this) - this.gutterRight - (this.axisWidth * 0.4), RGraph.GetHeight(this) - this.gutterBottom + 14,RGraph.number_format(this, this.scale[2], this.Get('chart.units.pre'), this.Get('chart.units.post')), null, 'center');
        RGraph.Text(this.context, font, size, RGraph.GetWidth(this) - this.gutterRight - (this.axisWidth * 0.6), RGraph.GetHeight(this) - this.gutterBottom + 14,RGraph.number_format(this, this.scale[1], this.Get('chart.units.pre'), this.Get('chart.units.post')), null, 'center');
        RGraph.Text(this.context, font, size, RGraph.GetWidth(this) - this.gutterRight - (this.axisWidth * 0.8), RGraph.GetHeight(this) - this.gutterBottom + 14,RGraph.number_format(this, this.scale[0], this.Get('chart.units.pre'), this.Get('chart.units.post')), null, 'center');
    }
    
    /**
    * Draws the titles
    */
    RGraph.Bipolar.prototype.DrawTitles = function ()
    {
        RGraph.Text(this.context, this.Get('chart.text.font'), this.Get('chart.text.size'), this.gutterLeft + 5, (this.gutterTop / 2) + 5, String(this.Get('chart.title.left')), 'center');
        RGraph.Text(this.context,this.Get('chart.text.font'), this.Get('chart.text.size'), RGraph.GetWidth(this) - this.gutterRight - 5, (this.gutterTop / 2) + 5, String(this.Get('chart.title.right')), 'center', 'right');
        
        // Draw the main title for the whole chart
        RGraph.DrawTitle(this.canvas, this.Get('chart.title'), this.gutterTop, null, this.Get('chart.title.size') ? this.Get('chart.title.size') : null);
    }


    /**
    * This function is used by MSIE only to manually draw the shadow
    * 
    * @param array coords The coords for the bar
    */
    RGraph.Bipolar.prototype.DrawIEShadow = function (coords)
    {
        var prevFillStyle = this.context.fillStyle;
        var offsetx = this.Get('chart.shadow.offsetx');
        var offsety = this.Get('chart.shadow.offsety');
        
        this.context.lineWidth = this.Get('chart.linewidth');
        this.context.fillStyle = this.Get('chart.shadow.color');
        this.context.beginPath();
        
        // Draw shadow here
        this.context.fillRect(coords[0] + offsetx, coords[1] + offsety, coords[2],coords[3]);

        this.context.fill();
        
        // Change the fillstyle back to what it was
        this.context.fillStyle = prevFillStyle;
    }


    /**
    * Returns the appropriate focussed bar coordinates
    * 
    * @param e object The event object
    */
    RGraph.Bipolar.prototype.getBar = function (e)
    {
        var obj         = e.target.__object__;
        var canvas      = obj.canvas;
        var context     = obj.context;
        var mouseCoords = RGraph.getMouseXY(e);

        /**
        * Loop through the bars determining if the mouse is over a bar
        */
        for (var i=0; i<obj.coords.length; i++) {

            var mouseX = mouseCoords[0];
            var mouseY = mouseCoords[1];
            var left   = obj.coords[i][0];
            var top    = obj.coords[i][1];
            var width  = obj.coords[i][2];
            var height = obj.coords[i][3];

            if (mouseX >= left && mouseX <= (left + width) && mouseY >= top && mouseY <= (top + height) ) {
                return [left,top,width,height,i];
            }
        }

        return null;
    }