#include "error.h"

#include "pebble.h"
#include "../menu/row.h"

enum DepartureKeyEnum {
    // 0, 1, 2 allocated for AppMessageEnum
    TITLE = 3,
    SUBTITLE = 4
};

Error *error_create(DictionaryIterator *iter) {
    Error *error = calloc(1, sizeof(Error));

    Tuple *title_tuple = dict_find(iter, TITLE);
    memcpy(error->title, title_tuple->value->cstring, title_tuple->length);

    Tuple *subtitle_tuple = dict_find(iter, SUBTITLE);
    memcpy(error->subtitle, subtitle_tuple->value->cstring, subtitle_tuple->length);

    return error;
}

void error_destroy(Error *error) {
    free(error);
}

Row *error_convert(void *data) {
    Error *error = data;

    Row *row = row_create();

    memcpy(row->title, error->title, 64);
    memcpy(row->subtitle, error->subtitle, 64);

    return row;
}