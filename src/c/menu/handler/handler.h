#pragma once

#include "pebble.h"

extern uint16_t get_num_sections_callback(MenuLayer *menu_layer, void *data);
extern uint16_t get_num_rows_callback(MenuLayer *menu_layer, uint16_t section_index, void *data);
extern int16_t get_header_height_callback(MenuLayer *menu_layer, uint16_t section_index, void *data);
extern void draw_header_callback(GContext *ctx, const Layer *cell_layer, uint16_t section_index, void *data);
extern void draw_row_callback(GContext *ctx, const Layer *cell_layer, MenuIndex *cell_index, void *data);
extern void selection_will_change_callback(struct MenuLayer *menu_layer, MenuIndex *new_index, MenuIndex old_index, void *data);
