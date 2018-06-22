
const indexedDB = window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB;
const IDBTransaction = window.IDBTransaction ||
  window.webkitIDBTransaction ||
  window.msIDBTransaction;
const IDBKeyRange = window.IDBKeyRange ||
  window.webkitIDBKeyRange ||
  window.msIDBKeyRange;

class Store {
  constructor(storeName) {
    if (!indexedDB || !IDBTransaction || !IDBKeyRange) { throw new Error('您的浏览器不支持indexedDB'); }
    this.name = this.name || storeName;
    this.databaseName = 'myEncapsulation';
    return this;
  }

  setDB(database) {
    if (!database || !(database instanceof IDBDatabase)) { throw new TypeError('参数应是数据库对象'); }
    this.database = database;
    this.version = this.database.version;
    this.database.onclose = () => {
      this.database.isOpen = false;
    };
    return database;
  }

  closeDB() {
    return this.database && (this.database instanceof IDBDatabase) && this.database.close();
  }

  openDB(version) {
    // openDB()
    // openDB(version) version是版本号 int类型 例如openDB(99)
    // 返回值 promise 对象 resolve(this.database) reject(error);
    if (version) {
      if (!Number.isSafeInteger(version)) { throw new TypeError('版本号只能是整数'); }
      if (version < this.version) { throw new TypeError('新版本号不能比当前版本号低'); }
    }
    const openVersion = (version && Number.isSafeInteger(version) && (version > this.version))
      ? version : this.version;
    this.closeDB();
    const promise = new Promise((resolve, reject) => {
      // const request = indexedDB.open(this.databaseName, openVersion);
      const request = (version && Number.isSafeInteger(version) && (version > this.version))
        ? indexedDB.open(this.databaseName, openVersion)
        : indexedDB.open(this.databaseName);
      request.onsuccess = () => {
        this.setDB(request.result);
        this.database.isOpen = true;
        resolve(this.database);
      };
      request.onerror = (event) => { reject(event.target.error); };
      request.onupgradeneeded = (event) => {
        this.setDB(event.target.result);
        const tx = event.target.transaction;
        if (!tx.objectStoreNames.contains(this.name)) {
          this.database.createObjectStore(this.name, { keyPath: 'id', autoIncrement: true });
          tx.objectStore(this.name).createIndex('id', 'id', { unique: true });
        }
      };
    });
    return promise;
  }

  ready() {
    return this.openDB().then(database => this.setDB(database));
  }

  isReady() {
    return this.database && (this.database instanceof IDBDatabase) && this.database.isOpen;
  }

  addColumn(column, option) {
    // addColumn(columnName) columnName是索引名,String类型,如addColumn('age')
    // addColumn(columnName, option) option目前只能指定是否去重复,如addColumn('name', { unique: true })
    // 返回值promise resolve(database) database是示例对象的database属性
    if (!column || (typeof column !== 'string')) { throw new TypeError('索引名称必须存在且为字符串'); }
    if (option && (typeof option !== 'object')) { throw new TypeError('索引选项应是对象类型'); }
    const columnOption = {};
    columnOption.unique = option && option.unique;
    const openVersion = this.version + 1;
    this.closeDB();
    const promise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.databaseName, openVersion);
      request.onsuccess = () => {
        this.setDB(request.result);
        this.database.isOpen = true;
        resolve(this.database);
      };
      request.onerror = (event) => { reject(event.target.error); };
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        const tx = event.target.transaction;
        this.database = db;
        this.version = this.database.version;
        const store = (tx && tx.objectStoreNames.contains(this.name))
          ? tx.objectStore(this.name)
          : db.createObjectStore(this.name, { keyPath: 'id', autoIncrement: true });
        if (!store.indexNames.contains('id')) {
          store.createIndex('id', 'id', { unique: true });
        }
        if (!store.indexNames.contains(column)) {
          store.createIndex(column, column, { unique: columnOption.unique });
        }
      };
    });
    return promise;
  }

  deleteColumn(column) {
    // deleteColumn(column) columnName是索引名,String类型,如deleteColumn('userName')
    // 返回值promise resolve(database) database是示例对象的database属性
    if (!column || (typeof column !== 'string')) { throw new TypeError('需要一个字符串类型的索引名'); }
    this.closeDB();
    const openVersion = this.version + 1;
    const promise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.databaseName, openVersion);
      request.onsuccess = () => {
        this.setDB(request.result);
        this.database.isOpen = true;
        resolve(this.database);
      };
      request.onerror = (event) => {
        this.database = request.result;
        this.version = request.result.version;
        this.database.close();
        reject(event.target.error);
      };
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        const tx = event.target.transaction;
        this.database = db;
        this.version = this.database.version;
        const store = (tx && tx.objectStoreNames.contains(this.name))
          ? tx.objectStore(this.name)
          : db.createObjectStore(this.name, { keyPath: 'id', autoIncrement: true });
        if (!store.indexNames.contains('id')) {
          store.createIndex('id', 'id', { unique: true });
        }

        if (store.indexNames.contains(column)) {
          store.deleteIndex(column);
        }
      };
    });
    return promise;
  }

  addColumns(columns) {
    // addColumns(['userName'])
    // addColumns([{ index: 'userAge', unique: false }])
    // addColumns(['userName', { index: 'userAge', unique: false }])
    // 返回值promise resolve(database) database是示例对象的database属性
    if (!columns || !(columns instanceof Array)) { throw new TypeError('列名组应该是一个数组'); }
    const newColumns = [];
    columns.forEach((column) => {
      const columnType = typeof column;
      if (columnType === 'string') {
        newColumns.push({ index: column, unique: false });
      } else if (columnType === 'object') {
        newColumns.push({ index: column.index, unique: column.unique });
      } else {
        throw new TypeError('索引列格式错误');
      }
    });
    this.closeDB();
    const openVersion = this.version + 1;
    const promise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.databaseName, openVersion);
      request.onsuccess = () => {
        this.setDB(request.result);
        this.database.isOpen = true;
        resolve(this.database);
      };
      request.onerror = (event) => {
        this.database = request.result;
        this.version = request.result.version;
        this.database.close();
        reject(event.target.error);
      };
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        const tx = event.target.transaction;
        this.database = db;
        this.version = this.database.version;
        const store = (tx && tx.objectStoreNames.contains(this.name))
          ? tx.objectStore(this.name)
          : db.createObjectStore(this.name, { keyPath: 'id', autoIncrement: true });
        if (!store.indexNames.contains('id')) {
          store.createIndex('id', 'id', { unique: true });
        }
        newColumns.forEach((column) => {
          if (!store.indexNames.contains(column.index)) {
            store.createIndex(column.index, column.index, { unique: column.unique });
          }
        });
        this.database = db;
      };
    });
    return promise;
  }

  deleteColumns(columns) {
    // demo.deleteColumns(['userName', 'userAge'])
    // 返回值promise resolve(database) database是示例对象的database属性
    if (!columns || !(columns instanceof Array)) { throw new TypeError('需要一个包含索引名的数组'); }
    columns.forEach((column) => {
      if (!column || (typeof column !== 'string')) { throw new TypeError('索引名不是字符串类型'); }
    });
    this.closeDB();
    const openVersion = this.version + 1;
    const promise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.databaseName, openVersion);
      request.onsuccess = () => {
        this.setDB(request.result);
        this.database.isOpen = true;
        resolve(this.database);
      };
      request.onerror = (event) => {
        this.database = request.result;
        this.version = request.result.version;
        this.database.close();
        reject(event.target.error);
      };
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        const tx = event.target.transaction;
        this.database = db;
        this.version = this.database.version;
        const store = (tx && tx.objectStoreNames.contains(this.name))
          ? tx.objectStore(this.name)
          : db.createObjectStore(this.name, { keyPath: 'id', autoIncrement: true });
        if (!store.indexNames.contains('id')) {
          store.createIndex('id', 'id', { unique: true });
        }
        columns.forEach((column) => {
          if (store.indexNames.contains(column)) {
            store.deleteIndex(column);
          }
        });
      };
    });
    return promise;
  }

  deleteItem(id) {
    // deleteItem(id) id是目标数据的id属性值 Integer类型,如deleteItem(1)
    // 返回值promise resolve(undefined)
    if (!Number.isSafeInteger(id)) { throw new TypeError('参数只能是目标数据的id属性值'); }
    if (!this.isReady()) { throw new Error('数据库尚未准备好'); }
    const store = this.database.transaction(this.name, 'readwrite').objectStore(this.name);
    const promise = new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => { resolve(request.result); };
      request.onerror = (event) => { reject(event.target.error); };
    });
    return promise;
  }

  deleteItems(ids) {
    // deleteItems(ids) ids是由id组成的数组 Array类型,如deleteItems([1,2,3])
    // 返回值promise resolve(undefined)
    if (!(ids instanceof Array) || (ids.length === 0)) { throw new TypeError('参数只能是目标数据的id属性值组成的数组且不能为空'); }
    ids.forEach((id) => {
      if (!Number.isSafeInteger(id)) { throw new TypeError('id属性值应是整数'); }
    });
    let promise = this.ready();
    ids.forEach((id) => {
      promise = promise.then(() => this.deleteItem(id));
    });
    return promise;
  }

  delete(args) {
    // delete(id) id是目标数据的id属性值 Integer类型,如delete(1)
    // delete(ids) ids是由id组成的数组 Array类型,如delete([1,2,3])
    // 返回值promise resolve(undefined)
    const isInt = Number.isSafeInteger(args);
    const isArray = args instanceof Array;
    if (!isInt && !isArray) { throw new TypeError('参数只能是目标数据的id属性值或由id组成的数组'); }
    let promise;
    if (isInt) {
      promise = this.deleteItem(args);
    } else if (isArray) {
      promise = this.deleteItems(args);
    }
    return promise;
  }

  setItem(item) {
    // setItem(item) item插入的条目, Object类型,如 setItem({ id: 3, name: 'xiaoming', age: 10 })
    // 使用id属性为主键，可以设置item.id属性值(Integer类型)为插入的主键,若item.id不合法则自动分配id属性
    // 返回值是promise
    // resolve() 输出保存后的item.id
    if (!item || (typeof item !== 'object')) { throw new TypeError('参数只能是一个对象'); }
    if ((item.id !== undefined) && !Number.isSafeInteger(item.id)) { throw new TypeError('参数的id属性只能为整数'); }
    if (!this.isReady()) { throw new Error('数据库尚未准备好'); }
    const store = this.database.transaction(this.name, 'readwrite').objectStore(this.name);
    const promise = new Promise((resolve, reject) => {
      const request = store.put(item);
      request.onsuccess = () => { resolve(request.result); };
      request.onerror = (event) => { reject(event.target.error); };
    });
    return promise;
  }

  setItems(items) {
    // setItems(items) items是由欲插入条目组成的数组，Array类型,如[{id:1, age:12}, {name: 'x', age: 12}]
    // 返回值是promise
    // resolve() 输出最后保存的item.id
    if (!items || !(items instanceof Array)) { throw new TypeError('参数应是一个数组'); }
    items.forEach((item) => {
      if (!item || (typeof item !== 'object')) { throw new TypeError('参数只能是一个对象'); }
    });
    if (!this.isReady()) { throw new Error('数据库尚未准备好'); }
    let promise = this.ready();
    items.forEach((item) => {
      promise = promise.then(() => this.setItem(item));
    });
    return promise;
  }

  set(args) {
    // set(item) 调用setItem(item)
    // set(items) 调用setItems(items)
    const isArray = args instanceof Array;
    const isObj = (typeof args === 'object');
    if (!isObj && !isArray) { throw new TypeError('参数只能是目标数据的id属性值或由id组成的数组'); }
    let result;
    if (isArray) {
      result = this.setItems(args);
    } else if (isObj) {
      result = this.setItem(args);
    }
    return result;
  }

  getItem(id) {
    // getItem(id) id是目标数据的id属性值 Integer类型,如getItem(1) 拿到id是1的数据
    // 返回值promise resolve(item) item是结果条目或undefiend
    if (!Number.isSafeInteger(id)) { throw new TypeError('参数只能是目标数据的id属性值'); }
    if (!this.isReady()) { throw new Error('数据库尚未准备好'); }
    const store = this.database.transaction(this.name, 'readwrite').objectStore(this.name);
    const promise = new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => { resolve(request.result); };
      request.onerror = (event) => { reject(event.target.error); };
    });
    return promise;
  }

  getItems(ids) {
    // getItems(ids) ids是由id组成的数组 Array类型,如getItems([1,2,3])
    // 返回值promise resolve(items) items是由结果组成的数组
    if (!(ids instanceof Array) || (ids.length === 0)) { throw new TypeError('参数只能是目标数据的id属性值组成的数组且不能为空'); }
    ids.forEach((id) => {
      if (!Number.isSafeInteger(id)) { throw new TypeError('id属性值应是整数'); }
    });
    const sortIds = ids.sort();
    const range = IDBKeyRange.bound(sortIds[0], sortIds[sortIds.length - 1]);
    if (!this.isReady()) { throw new Error('数据库尚未准备好'); }
    const store = this.database.transaction(this.name, 'readwrite').objectStore(this.name);
    const promise = new Promise((resolve, reject) => {
      const request = store.getAll(range);
      request.onsuccess = () => { resolve(request.result); };
      request.onerror = (event) => { reject(event.target.error); };
    });
    const resPromise = promise.then((items) => {
      const result = [];
      items.forEach((item) => {
        if (sortIds.includes(item.id)) {
          result.push(item);
        }
      });
      return result;
    });
    return resPromise;
  }

  get(idQuery) {
    // get(id) id是目标数据的id属性值 Integer类型,如get(1) 调用getItem(id)
    // 返回值promise resolve(item) item是查询结果或undefiend
    // get(ids) ids是由id组成的数组 Array类型,如get([1,2,3]) 调用getItems(ids)
    // 返回值promise resolve(items) items是查询结果组成的数组
    const isInt = Number.isSafeInteger(idQuery);
    const isArray = idQuery instanceof Array;
    if (!isInt && !isArray) { throw new TypeError('参数只能是目标数据的id属性值或由id组成的数组'); }
    let promise;
    if (isInt) {
      promise = this.getItem(idQuery);
    } else if (isArray) {
      promise = this.getItems(idQuery);
    }
    return promise;
  }

  getAll(indexName) {
    // getAll(indexName) indexName参数是索引名,如getAll('id')
    // 返回值promise resolve(items) items是所有存在indexName列的数据组成的数组
    const openIndexName = indexName || 'id';
    if (typeof openIndexName !== 'string') { throw new TypeError('索引名只能是字符串'); }
    if (!this.isReady()) { throw new Error('数据库尚未准备好'); }
    const store = this.database.transaction(this.name, 'readwrite').objectStore(this.name);
    const index = store.index(openIndexName);
    const promise = new Promise((resolve, reject) => {
      const request = index.getAll();
      request.onsuccess = () => { resolve(request.result); };
      request.onerror = (event) => { reject(event.target.error); };
    });
    return promise;
  }

  findItems(attrQuery) {
    // findItem(attrQuery) attrQuery是目标条目的属性值,Object类型,如findItem({id: 1, name: 'joy'})
    // 返回值promise resolve(items) items是符合条件的条目组成的数组
    if (!attrQuery || (typeof attrQuery !== 'object')) { throw new TypeError('参数应该是一个对象'); }
    if (!this.isReady()) { throw new Error('数据库尚未准备好'); }
    const store = this.database.transaction(this.name, 'readwrite').objectStore(this.name);
    const keys = Object.keys(attrQuery);
    const firstIndex = store.index(keys[0]);
    const range = IDBKeyRange.only(attrQuery[keys[0]]);
    const promise = new Promise((resolve, reject) => {
      const request = firstIndex.getAll(range);
      request.onsuccess = () => { resolve(request.result); };
      request.onerror = (event) => { reject(event.target.error); };
    });
    const resPromise = promise.then((items) => {
      const result = [];
      items.forEach((item) => {
        let isEqual = 1;
        keys.forEach((key) => {
          if (item[key] !== attrQuery[key]) isEqual = 0;
        });
        if (isEqual) {
          result.push(item);
        }
      });
      return result;
    });
    return resPromise;
  }

  static openDB(databaseName) {
    // openDB(databaseName) databaseName是数据库名 string类型
    // 返回值promise resolve(IDBDatabase) reject(Error)
    if (!databaseName || (typeof databaseName !== 'string')) { throw new TypeError(`数据库名不能为${databaseName}`); }
    const promise = new Promise((resolve, reject) => {
      const request = indexedDB.open(databaseName);
      request.onsuccess = () => {
        const database = request.result;
        database.isOpen = true;
        database.onclose = () => { database.isOpen = false; };
        resolve(database);
      };
      request.onerror = event => reject(event.target.error);
    });
    return promise;
  }
}

export default Store;
