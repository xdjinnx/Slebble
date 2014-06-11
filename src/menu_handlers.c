#include "pebble.h"
	
static AppTimer *menu_load_timer;

static char startmenu_title[5][32];

static char stationmenu_title[5][20][32];
static char stationmenu_subtitle[5][20][32];

static int station_variable = 0;
static int nr_station_variable = 0;
static int nr_ride_variable = 0;

static int callback_variable1 = 1;
static int callback_variable2 = 2;
	
static uint16_t menu_get_num_sections_callback(MenuLayer *menu_layer, void *data) {
	return 1;
}

static uint16_t menu_get_num_rows_callback(MenuLayer *menu_layer, uint16_t section_index, void *data) {
	int* data2 = data;
	if(*data2 == 1) {
		return nr_station_variable;
	}
	if(*data2 == 2) {
		return nr_ride_variable;
	}
	return 0;
}

static int16_t menu_get_header_height_callback(MenuLayer *menu_layer, uint16_t section_index, void *data) {
	// This is a define provided in pebble.h that you may use for the default height
	return MENU_CELL_BASIC_HEADER_HEIGHT;
}

static void menu_draw_header_callback(GContext* ctx, const Layer *cell_layer, uint16_t section_index, void *data) {
	int* data2 = data;
	if(*data2 == 1) {
		menu_cell_basic_header_draw(ctx, cell_layer, "Stations");
	}
	if(*data2 == 2) {
		menu_cell_basic_header_draw(ctx, cell_layer, "Rides");
	}
}

static void menu_draw_row_callback(GContext* ctx, const Layer *cell_layer, MenuIndex *cell_index, void *data) {
	int* data2 = data;
	if(*data2 == 1) {
		menu_cell_basic_draw(ctx, cell_layer, startmenu_title[cell_index->row], "", NULL);
	}
	if(*data2 == 2) {
		menu_cell_basic_draw(ctx, cell_layer, stationmenu_title[station_variable][cell_index->row], stationmenu_subtitle[station_variable][cell_index->row], NULL);
	}
}
