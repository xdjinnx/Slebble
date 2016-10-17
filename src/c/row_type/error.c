#include "error.h"

#include "../menu/row.h"
#include "pebble.h"

enum DepartureKeyEnum {
    // 0, 1, 2 allocated for AppMessageEnum
    TITLE = 3,
    SUBTITLE = 4
};

typedef struct ErrorData {
    char title[64];
    char subtitle[64];
} ErrorData;

void error_update(Error *error) {
    ErrorData *error_data = error->data;

    memcpy(error->title, error_data->title, 64);
    memcpy(error->subtitle, error_data->subtitle, 64);
}

Error *error_create(DictionaryIterator *iter) {
    ErrorData *error_data = calloc(1, sizeof(ErrorData));

    Tuple *title_tuple = dict_find(iter, TITLE);
    memcpy(error_data->title, title_tuple->value->cstring, title_tuple->length);

    Tuple *subtitle_tuple = dict_find(iter, SUBTITLE);
    memcpy(error_data->subtitle, subtitle_tuple->value->cstring, subtitle_tuple->length);

    Error *error = row_create(error_data);
    error_update(error);

    return error;
}

void error_destroy(Error *error) {
    free(error);
}