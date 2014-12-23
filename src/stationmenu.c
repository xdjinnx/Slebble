#include "stationmenu.h"
#include "menu_handlers.h"

GBitmap* loadImage;
BitmapLayer *loading_layer;

Window* stationmenu_window;
MenuLayer *stationmenu_layer;
int stationmenu_callback_key = STATIONMENU_CALLBACK;

void stationmenu_select_callback(MenuLayer *menu_layer, MenuIndex *cell_index, void *data){}

bool tick_handler_bool = false;
void tick_handler(struct tm *tick_time, TimeUnits units_changed) {
	if(tick_handler_bool) {
		for(int i = 0; i < 20; i++) {
			if(stationmenu_minLeft[i] > 0)
		       	stationmenu_minLeft[i]--;
		}
	    menu_layer_reload_data(stationmenu_layer);
    }
}

void remove_loadscreen() {
	menu_layer_reload_data(stationmenu_layer);
	bitmap_layer_destroy(loading_layer);
	gbitmap_destroy(loadImage);
	menu_layer_set_click_config_onto_window(stationmenu_layer, stationmenu_window);
	vibes_short_pulse();
	tick_handler_bool = true;
	loaded_rows = 0;
}


void stationmenu_window_load(Window *window) {
	
	Layer *window_layer = window_get_root_layer(window);
	GRect bounds = layer_get_frame(window_layer);
	
	stationmenu_layer = menu_layer_create(bounds);

	menu_layer_set_callbacks(stationmenu_layer, &stationmenu_callback_key, (MenuLayerCallbacks){
		.get_num_sections = menu_get_num_sections_callback,
		.get_num_rows = menu_get_num_rows_callback,
		.get_header_height = menu_get_header_height_callback,
		.draw_header = menu_draw_header_callback,
		.draw_row = menu_draw_row_callback,
		.select_click = stationmenu_select_callback,
	});
	
	loadImage = gbitmap_create_with_resource(RESOURCE_ID_SLEBBLE_LOADING_BLACK);
	loading_layer = bitmap_layer_create(bounds);
	bitmap_layer_set_background_color(loading_layer, GColorWhite);
	bitmap_layer_set_bitmap(loading_layer, loadImage);
	
	
	layer_add_child(window_layer, menu_layer_get_layer(stationmenu_layer));
	layer_add_child(window_layer, bitmap_layer_get_layer(loading_layer));
	
}

void stationmenu_window_unload(Window *window) {
	tick_handler_bool = false;
	window_stack_remove(window, true);
	window_destroy(window);
	menu_layer_destroy(stationmenu_layer);
}


void create_stationmenu() {
	stationmenu_window = window_create();
	
	window_set_window_handlers(stationmenu_window, (WindowHandlers) {
		.load = stationmenu_window_load,
		.unload = stationmenu_window_unload,
	});
	
	window_stack_push(stationmenu_window, true);
	
}