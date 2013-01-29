dataslider
==========

Use a slider to convoke data-display functions with boundary parameters.


.load(data, function(canvas,data)) 
==================================

Load the panorama with data, and supply a display function
that will be passed the canvas and the data. 

.setDisplayAddFn(function(canvas,olddata,newdata))
==================================================

Supply the display function when new data is added to the
panorama.

.setAddFn(function(olddata,newdata))
====================================

Supply a function that tells dataslider how to add data
together. The return value will overwrite the stored data.

.listen(event,type)
===================

Supply an event emitter and the type of event to listen for. When
that type is fired, two things happen

1. the function supplied in setAddFn will trigger
2. the function supplied in setDisplayAddFn will trigger.

The order of these is settable on invocation, but defaults
to the above order. If addFn happens first, then old data in setDisplayFn will be the old + new data, and the newdata will simply
be provided for reference.

.onchange(function(params))
===========================

Supply a function that will recieve a params s.t.

    params : { pos : { left : 20, right:40 }, type : drag }
    // type will either be a drag or resize.

.setImages(images)
==================
Supply an image list with image objects, where each image object
is the native Image object. Each image object should also
have a .name property. The following will be used as a lookup
table between image objects and how they will be used.

name: selector_left.png  -> left selector

name: selector_right.png  -> right selector

name: selector_left_hover.png  -> left selector on hover

name: selector_right_hover.png  -> right selector on hover

name: selector_left_down.png  -> left selector on mousedown

name: selector_right_down.png  -> right selector on mousedown


Copy Pasta
==========

Since you need to setup these functions, here is some copy paste.

    dataslider.to();
    dataslider.onchange(function(params) { });
    dataslider.setImages(images);
    dataslider.load(,function(canvas,data) { });
    dataslider.listen(,);    
    dataslider.setAddFn(function(old,newdata) {})
    dataslider.setDisplayAddFn(function(canvas,old,newdata) { });
