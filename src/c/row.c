#include "row.h"
#include "pebble.h"

Row* row_create() {
  return malloc(sizeof(Row));
}

void row_destroy(Row *row){
  free(row);
}

void row_memcpy(Row *copy, Row *row){

  memcpy(copy->title, row->title, 32);
  memcpy(copy->subtitle, row->subtitle, 32);
  copy->data_int = row->data_int;
  memcpy(copy->data_char, row->data_char, 32);

}
