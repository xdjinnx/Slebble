#ifndef __MENU_HANDLERS__
#define __MENU_HANDLERS__
	
#include "pebble.h"

uint16_t menu_get_num_sections_callback(MenuLayer *menu_layer, void *data);
uint16_t menu_get_num_rows_callback(MenuLayer *menu_layer, uint16_t section_index, void *data);
int16_t menu_get_header_height_callback(MenuLayer *menu_layer, uint16_t section_index, void *data);
void menu_draw_header_callback(GContext* ctx, const Layer *cell_layer, uint16_t section_index, void *data);
void menu_draw_row_callback(GContext* ctx, const Layer *cell_layer, MenuIndex *cell_index, void *data);

char startmenu_title[5][32];
char stationmenu_title[6][20][32];
char stationmenu_subtitle[6][20][32];
int stationmenu_minLeft[6][20];
int station_variable;
int callback_variable1;
int callback_variable2;
int loaded_rows;
int nr_station_variable;
int nr_ride_variable;

#endif