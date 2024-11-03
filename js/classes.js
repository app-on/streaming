//classes.js
class ElementMakeDrag {
  constructor(element) {
    this._element = element;
    this._events = {};
  }

  on = (type, callback) => {
    this._events[type] = callback;
  };

  start = () => {
    const start = (element) => {
      var draggable = element;
      var initialX, initialY, currentX, currentY;
      let allowtouchstart = true;

      const startDragging = (e) => {
        if (allowtouchstart) {
          allowtouchstart = false;
          if (e.type === "touchstart") {
            const index = Array.from(e.touches).findIndex((touch) =>
              draggable.contains(touch.target)
            );

            initialX = e.touches[index].clientX - draggable.offsetLeft;
            initialY = e.touches[index].clientY - draggable.offsetTop;
          } else {
            initialX = e.clientX - draggable.offsetLeft;
            initialY = e.clientY - draggable.offsetTop;
          }

          if (typeof this._events.start == "function") {
            this._events.start({
              e,
              xy: {
                initial: {
                  x: initialX,
                  y: initialY,
                },
                current: {
                  x: currentX,
                  y: currentY,
                },
              },
              target: draggable,
            });
          }

          if (e.type === "mousedown") {
            e.preventDefault();
          }

          element.addEventListener("touchmove", drag, { passive: false });
          element.addEventListener("touchend", stopDragging);
          element.addEventListener("mousemove", drag);
          element.addEventListener("mouseup", stopDragging);
          element.addEventListener("mouseleave", stopDragging);
        }
      };

      const drag = (e) => {
        if (e.type === "touchmove") {
          e.preventDefault();
          const index = Array.from(e.touches).findIndex((touch) =>
            draggable.contains(touch.target)
          );

          currentX = e.touches[index].clientX - initialX;
          currentY = e.touches[index].clientY - initialY;
        } else {
          currentX = e.clientX - initialX;
          currentY = e.clientY - initialY;
        }

        if (typeof this._events.move == "function") {
          this._events.move({
            e,
            xy: {
              initial: {
                x: initialX,
                y: initialY,
              },
              current: {
                x: currentX,
                y: currentY,
              },
            },
            target: draggable,
          });
        }
      };

      const stopDragging = (e) => {
        allowtouchstart = true;
        if (typeof this._events.end == "function") {
          this._events.end({
            e,
            xy: {
              initial: {
                x: initialX,
                y: initialY,
              },
              current: {
                x: currentX,
                y: currentY,
              },
            },
            target: draggable,
          });
        }

        if (e.touches && e.touches.length > 0) return;
        element.removeEventListener("touchmove", drag);
        element.removeEventListener("touchend", stopDragging);
        element.removeEventListener("mousemove", drag);
        element.removeEventListener("mouseup", stopDragging);
        element.removeEventListener("mouseleave", stopDragging);
      };

      draggable.addEventListener("touchstart", startDragging, {
        passive: false,
      });
      draggable.addEventListener("mousedown", startDragging);
    };

    start(this._element);
  };
}
