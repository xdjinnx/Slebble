#pragma once
#include "pebble.h"

typedef struct Row {
    char title[64];
    char subtitle[64];
} Row;

extern Row *row_create();
extern void row_destroy(Row *row);
extern void row_memcpy(Row *copy, Row *row);
