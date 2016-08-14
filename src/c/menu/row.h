#pragma once
#include "pebble.h"

typedef struct Row {
    char title[32];
    char subtitle[32];
    void *data;
} Row;

extern Row *row_create();
extern void row_destroy(Row *row);
extern void row_memcpy(Row *copy, Row *row);
