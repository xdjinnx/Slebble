#include "menu_handlers.h"
#include "pebble.h"
#include "mini-printf.h"

char startmenu_title[5][32];

char stationmenu_title[6][20][32];
char stationmenu_subtitle[6][20][32];
int stationmenu_minLeft[6][20];

int station_variable = 0;
int nr_station_variable = 0;
int nr_ride_variable = 0;
int loaded_rows = 0;

int callback_variable1 = 1;
int callback_variable2 = 2;
	
uint16_t menu_get_num_sections_callback(MenuLayer *menu_layer, void *data) {
	return 1;
}

uint16_t menu_get_num_rows_callback(MenuLayer *menu_layer, uint16_t section_index, void *data) {
	int* data2 = data;
	if(*data2 == 1) {
		return nr_station_variable + 1;
	}
	if(*data2 == 2) {
		return nr_ride_variable;
	}
	return 0;
}

int16_t menu_get_header_height_callback(MenuLayer *menu_layer, uint16_t section_index, void *data) {
	// This is a define provided in pebble.h that you may use for the default height
	return MENU_CELL_BASIC_HEADER_HEIGHT;
}

void menu_draw_header_callback(GContext* ctx, const Layer *cell_layer, uint16_t section_index, void *data) {
	int* data2 = data;
	if(*data2 == 1) {
		menu_cell_basic_header_draw(ctx, cell_layer, "Stations");
	}
	if(*data2 == 2) {
		if(station_variable == 0)
			menu_cell_basic_header_draw(ctx, cell_layer, "Nearby Station");
		else
			menu_cell_basic_header_draw(ctx, cell_layer, startmenu_title[station_variable - 1]);
	}
}

void menu_draw_row_callback(GContext* ctx, const Layer *cell_layer, MenuIndex *cell_index, void *data) {
	int* data2 = data;
	if(*data2 == 1) {
		if(cell_index->row == 0)
			menu_cell_basic_draw(ctx, cell_layer, "Nearby Station", "", NULL);
		else
			menu_cell_basic_draw(ctx, cell_layer, startmenu_title[cell_index->row - 1], "", NULL);
	}
	if(*data2 == 2) {
		if(stationmenu_minLeft[station_variable][cell_index->row] == -1){
			menu_cell_basic_draw(ctx, cell_layer, stationmenu_title[station_variable][cell_index->row], stationmenu_subtitle[station_variable][cell_index->row], NULL);
		}
		else if(stationmenu_minLeft[station_variable][cell_index->row] > 0) {
			char buf[7];
			mini_snprintf(buf, 7, "%dmin", stationmenu_minLeft[station_variable][cell_index->row]);
			char buff[38];
			mini_snprintf(buff, 38, "%s - %s", buf, stationmenu_title[station_variable][cell_index->row]);
			
			menu_cell_basic_draw(ctx, cell_layer, buff, stationmenu_subtitle[station_variable][cell_index->row], NULL);
		} else {
			char buff[38];
			mini_snprintf(buff, 38, "Nu - %s", stationmenu_title[station_variable][cell_index->row]);
			
			menu_cell_basic_draw(ctx, cell_layer, buff, stationmenu_subtitle[station_variable][cell_index->row], NULL);
		}
	}
}
