#include "pebble.h"
#include "menu_handlers.h"
#include "linkedlist.h"

struct node *root_startmenu;

char stationmenu_title[20][32];
char stationmenu_subtitle[20][32];
int stationmenu_minLeft[20];
	
int station_variable = 0;
int nr_station_variable = 0;
int nr_ride_variable = 0;
int loaded_rows = 0;
	
uint16_t menu_get_num_sections_callback(MenuLayer *menu_layer, void *data) {
	return 1;
}

uint16_t menu_get_num_rows_callback(MenuLayer *menu_layer, uint16_t section_index, void *data) {
	int* data2 = data;
	if(*data2 == STARTMENU_CALLBACK) {
		return nr_station_variable + 1;
	}
	if(*data2 == STATIONMENU_CALLBACK) {
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
	if(*data2 == STARTMENU_CALLBACK) {
		menu_cell_basic_header_draw(ctx, cell_layer, "Stations");
	}
	if(*data2 == STATIONMENU_CALLBACK) {
		if(station_variable == 0)
			menu_cell_basic_header_draw(ctx, cell_layer, "Nearby Station");
		else
			menu_cell_basic_header_draw(ctx, cell_layer, linkedlist_get(root_startmenu, station_variable - 1)->title);
	}
}

void menu_draw_row_callback(GContext* ctx, const Layer *cell_layer, MenuIndex *cell_index, void *data) {
	int* data2 = data;
	if(*data2 == STARTMENU_CALLBACK) {
		if(cell_index->row == 0)
			menu_cell_basic_draw(ctx, cell_layer, "Nearby Station", "", NULL);
		else {
			menu_cell_basic_draw(ctx, cell_layer, linkedlist_get(root_startmenu, (cell_index->row)-1)->title, "", NULL);
		}
	}
	if(*data2 == STATIONMENU_CALLBACK) {
		if(stationmenu_minLeft[cell_index->row] == -1){
			menu_cell_basic_draw(ctx, cell_layer, stationmenu_title[cell_index->row], stationmenu_subtitle[cell_index->row], NULL);
		}
		else if(stationmenu_minLeft[cell_index->row] > 0) {
			char buf[7];
			snprintf(buf, 7, "%dmin", stationmenu_minLeft[cell_index->row]);
			char buff[38];
			snprintf(buff, 38, "%s - %s", buf, stationmenu_title[cell_index->row]);
			
			menu_cell_basic_draw(ctx, cell_layer, buff, stationmenu_subtitle[cell_index->row], NULL);
		} else {
			char buff[38];
			snprintf(buff, 38, "Nu - %s", stationmenu_title[cell_index->row]);
			
			menu_cell_basic_draw(ctx, cell_layer, buff, stationmenu_subtitle[cell_index->row], NULL);
		}
	}
}
