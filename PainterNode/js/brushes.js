/*
 * Title: Brushes module
 * Author: AlekPet
 * Github: https://github.com/AlekPet
 * Github extensions ComfyUI: https://github.com/AlekPet/ComfyUI_Custom_Nodes_AlekPet
 */
import { fabric } from "../../lib/fabric.js";

fabric.SymmetryBrush = fabric.util.createClass(fabric.BaseBrush, {
  initialize: function (canvas) {
    this.canvas = canvas;
    this.ctx = canvas.contextTop;
    this._points = {
      // Normal
      default: { points: [], enable: true, type: "x=x,y=y" }, // x=x,y=y
      width_heigth: { points: [], enable: true, type: "x=w-x,y=h-y" }, // x=w-x,y=h-y
      width_x: { points: [], enable: true, type: "x=w-x,y=y" }, // x=w-x,y=y
      heigth_y: { points: [], enable: true, type: "x=x,y=h-y" }, // x=x,y=h-y
      // Reverse
      rev_default: { points: [], enable: true, type: "x=y,y=x" }, // x=y,y=x
      rev_width_heigth: { points: [], enable: true, type: "x=h-y,y=w-x" }, // x=h-y,y=w-x
      rev_width_x: { points: [], enable: true, type: "x=h-y,y=x" }, // x=h-y,y=x
      rev_heigth_y: { points: [], enable: true, type: "x=y,y=w-x" }, // x=y,y=w-x
    };
  },

  _updatePoints: function (options) {
    // Normal
    this._points["default"].points.push(
      new fabric.Point(options.pointer.x, options.pointer.y)
    );

    this._points["width_heigth"].points.push(
      new fabric.Point(
        this.canvas.width - options.pointer.x,
        this.canvas.height - options.pointer.y
      )
    );

    this._points["width_x"].points.push(
      new fabric.Point(this.canvas.width - options.pointer.x, options.pointer.y)
    );
    this._points["heigth_y"].points.push(
      new fabric.Point(
        options.pointer.x,
        this.canvas.height - options.pointer.y
      )
    );

    // Reverse
    this._points["rev_default"].points.push(
      new fabric.Point(options.pointer.y, options.pointer.x)
    );

    this._points["rev_width_heigth"].points.push(
      new fabric.Point(
        this.canvas.height - options.pointer.y,
        this.canvas.width - options.pointer.x
      )
    );

    this._points["rev_width_x"].points.push(
      new fabric.Point(
        this.canvas.height - options.pointer.y,
        options.pointer.x
      )
    );

    this._points["rev_heigth_y"].points.push(
      new fabric.Point(options.pointer.y, this.canvas.width - options.pointer.x)
    );
  },

  convertPointsToSVGPath: function (points) {
    var correction = this.width / 1000;
    return fabric.util.getSmoothPathFromPoints(points, correction);
  },

  _drawSegment: function (mP, toP) {
    const ctx = this.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = this.color;
    ctx.lineCap = this.strokeLineCap;
    ctx.lineJoin = this.strokeLineJoin;
    ctx.lineWidth = this.width;
    ctx.moveTo(mP.x, mP.y);
    ctx.lineTo(toP.x, toP.y);
    ctx.stroke();
    ctx.restore();
  },

  createPath: function (pathData, shadow = false) {
    var path = new fabric.Path(pathData, {
      fill: null,
      stroke: this.color,
      strokeWidth: this.width,
      strokeLineCap: this.strokeLineCap,
      strokeMiterLimit: this.strokeMiterLimit,
      strokeLineJoin: this.strokeLineJoin,
      strokeDashArray: this.strokeDashArray,
    });
    if (this.shadow) {
      this.shadow.affectStroke = true;
      path.shadow = new fabric.Shadow(this.shadow);
    }

    return path;
  },

  onMouseDown: function (pointer, options) {
    if (!this.canvas._isMainEvent(options.e)) {
      return;
    }
    this._updatePoints(options);
  },

  onMouseMove: function (pointer, options) {
    if (!this.canvas._isMainEvent(options.e)) {
      return;
    }

    if (options.e.buttons !== 1) return;

    if (this._points["default"].points.length > 1) {
      for (let p_key in this._points) {
        const pointVal = this._points[p_key];
        if (pointVal.enable && pointVal.points.length > 0) {
          this._drawSegment(
            pointVal.points[pointVal.points.length - 2],
            pointVal.points[pointVal.points.length - 1]
          );
        }
      }
    }

    this._updatePoints(options);
    this.canvas.renderAll();
  },

  onMouseUp: function (options) {
    if (!this.canvas._isMainEvent(options.e)) {
      return true;
    }
    for (let p_key in this._points) {
      //if (p_key === "default") continue;
      const pointVal = this._points[p_key];
      if (pointVal.enable && pointVal.points.length > 0) {
        const path = this.convertPointsToSVGPath(pointVal.points);
        const offsetPath = this.createPath(path);
        this.canvas.add(offsetPath);
      }
      this._points[p_key].points = [];
    }
    return false;
  },
});

export default fabric.SymmetryBrush;
