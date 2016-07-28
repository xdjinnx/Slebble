#pragma once

typedef struct Row {
    char title[32];
    char subtitle[32];
    int data_int;
    char data_char[32];
} Row;

extern Row *row_create();
extern void row_destroy(Row *row);
extern void row_memcpy(Row *copy, Row *row);
