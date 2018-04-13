/* eslint-disable */
if (!Object.prototype.toGQL) {
  Object.prototype.toGql = function() {
    return JSON.stringify(this).replace(/\"(\w+)\":/gi, '$1:');
  };
}
