/*
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: limin
 * @Date: 2024-07-01 09:41:43
 * @LastEditors: limin
 * @LastEditTime: 2025-01-06 09:36:58
 * @FilePath: \gl_tape\utils\Queue.js
 */
class Queue {
  _items = [];
  constructor(items = []) {
    this._items = items;
  }

  enqueue(item) {
    this._items.push(item);
  }

  dequeue() {
    return this._items.shift();
  }

  get head() {
    return this._items[0];
  }

  get tail() {
    return this._items[this._items.length - 1];
  }
  get items() {
    return this._items;
  }

  get isEmpty() {
    return !this._items.length;
  }

  get size() {
    return this._items.length;
  }

  clear() {
    this._items = [];
  }
}
export default Queue;
