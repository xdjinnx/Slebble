#include "row.h"

#include "pebble.h"

Row *row_create() {
    return calloc(1, sizeof(Row));
}

void row_destroy(Row *row) {
    free(row);
}

void row_memcpy(Row *copy, Row *row) {
    memcpy(copy->title, row->title, 32);
    memcpy(copy->subtitle, row->subtitle, 32);
}
