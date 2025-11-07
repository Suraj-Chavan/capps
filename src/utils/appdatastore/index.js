export default (type) => {
  if (type == "local")
    return (collectionname) => {
      return {
        create(key, data) {
          return localStorage.setItem(
            collectionname + ":" + key,
            JSON.stringify(data)
          );
        },
        update(key, data) {
          return localStorage.setItem(
            collectionname + ":" + key,
            JSON.stringify(data)
          );
        },
        delete(key) {
          return localStorage.removeItem(collectionname + ":" + key);
        },
        read(key) {
          if (localStorage.getItem(collectionname + ":" + key))
            return JSON.parse(localStorage.getItem(collectionname + ":" + key));
        },
      };
    };
};
