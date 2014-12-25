#ifndef __MENU_HANDLERS__
#define __MENU_HANDLERS__

#include "pebble.h"
#include "linkedlist.h"

extern uint16_t menu_get_num_sections_callback(MenuLayer *menu_layer, void *data);
extern uint16_t menu_get_num_rows_callback(MenuLayer *menu_layer, uint16_t section_index, void *data);
extern int16_t menu_get_header_height_callback(MenuLayer *menu_layer, uint16_t section_index, void *data);
extern void menu_draw_header_callback(GContext* ctx, const Layer *cell_layer, uint16_t section_index, void *data);
extern void menu_draw_row_callback(GContext* ctx, const Layer *cell_layer, MenuIndex *cell_index, void *data);

extern struct node *root_startmenu;

extern char stationmenu_title[20][32];
extern char stationmenu_subtitle[20][32];
extern int stationmenu_minLeft[20];

extern int station_variable;
extern int loaded_rows;
extern int nr_station_variable;
extern int nr_ride_variable;

enum CallbackKeys {
  STARTMENU_CALLBACK = 1,
  STATIONMENU_CALLBACK= 2,
};

#endif