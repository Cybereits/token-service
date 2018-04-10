import { checkDocument, removeDirectivesFromDocument, } from 'apollo-utilities';
var connectionRemoveConfig = {
    test: function (directive) { return directive.name.value === 'client'; },
    remove: true,
};
var removed = new Map();
export function removeClientSetsFromDocument(query) {
    var cached = removed.get(query);
    if (cached)
        return cached;
    checkDocument(query);
    var docClone = removeDirectivesFromDocument([connectionRemoveConfig], query);
    removed.set(query, docClone);
    return docClone;
}
//# sourceMappingURL=utils.js.map