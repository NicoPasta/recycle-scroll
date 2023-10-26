export class Node {
  constructor(k, v) {
    this.key = k;
    this.value = v;
    this.prev = null;
    this.next = null;
  }
}

export class LRUCache {
  constructor(capacity) {
    // 缓存容量
    this.capacity = capacity;
    //  不用进行null检查
    this.head = new Node(null, null);
    this.tail = new Node(null, null);
    this.head.next = this.tail;
    this.tail.prev = this.head;
    this.cache = new Map();
  }

  get(key) {
    const node = this.cache.get(key);
    // 移动到头部
    if (node) {
      this.moveToHead(node);
      return node.value;
    }
    return null;
  }

  set(key, value) {
    const node = this.cache.get(key);
    // 新建node也移动到头部，如果超出容量，那么删除map中的对应值和链表的对应值
    if (node) {
      node.value = value;
      this.moveToHead(node);
      return;
    }
    const newNode = new Node(key, value);
    this.cache.set(key, newNode);
    this.addToHead(newNode);
    if (this.cache.size > this.capacity) {
      const tail = this.removeTail();
      this.cache.delete(tail.key);
      return tail.value;
    }
  }

  clear() {
    // 清空
    this.cache.clear();
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  //   新增删除和移动
  moveToHead(node) {
    this.removeNode(node);
    this.addToHead(node);
  }
  removeTail() {
    const prevTail = this.tail.prev;
    this.removeNode(this.tail.prev);
    return prevTail;
  }
  addToHead(node) {
    const next = this.head.next;
    this.head.next = node;
    node.prev = this.head;
    next.prev = node;
    node.next = next;
  }

  removeNode(node) {
    const prevNode = node.prev;
    const nextNode = node.next;
    prevNode.next = nextNode;
    nextNode.prev = prevNode;
  }
}
