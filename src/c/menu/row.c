#include "row.h"

#include "pebble.h"

Row *row_create(void *data) {
    Row *row = calloc(1, sizeof(Row));
    row->data = data;

    return row;
}

void row_destroy(Row *row) {
    free(row);
    free(row->data);
}

void row_memcpy(Row *copy, Row *row) {
    memcpy(copy->title, row->title, 32);
    memcpy(copy->subtitle, row->subtitle, 32);
}
