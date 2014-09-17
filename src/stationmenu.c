#include "menu_handlers.h"

GBitmap* loadImage;
BitmapLayer *loading_layer;

Window* windoww;
MenuLayer *stationmenu_layer;

void stationmenu_select_callback(MenuLayer *menu_layer, MenuIndex *cell_index, void *data){}

bool tick_handler_bool = false;
void tick_handler(struct tm *tick_time, TimeUnits units_changed) {
	if(tick_handler_bool) {
	    for(int i = 0; i < 6; i++) {
		    for(int j = 0; j < 20; j++) {
				if(stationmenu_minLeft[i][j] > 0)
		        	stationmenu_minLeft[i][j]--;
		    }
	    }
	    menu_layer_reload_data(stationmenu_layer);
    }
}

void remove_loadscreen() {
	menu_layer_reload_data(stationmenu_layer);
	bitmap_layer_destroy(loading_layer);
	gbitmap_destroy(loadImage);
	menu_layer_set_click_config_onto_window(stationmenu_layer, windoww);
	tick_handler_bool = true;
	loaded_rows = 0;
}


void window_load2(Window *window) {
	
	Layer *window_layer = window_get_root_layer(window);
	GRect bounds = layer_get_frame(window_layer);
	
	stationmenu_layer = menu_layer_create(bounds);

	menu_layer_set_callbacks(stationmenu_layer, &callback_variable2, (MenuLayerCallbacks){
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
	
	
	for(int j = 0; j < 5; j++) {
		for(int i = 0; i < 5; i++) {
		    char* temp = "";
		    memcpy(stationmenu_title[j][i], temp, 1);
		    memcpy(stationmenu_subtitle[j][i], temp, 1);
	    }
	}
	
}

void window_unload2(Window *window) {
	tick_handler_bool = false;
	window_stack_remove(window, true);
	window_destroy(window);
	menu_layer_destroy(stationmenu_layer);
}


void create_stationmenu() {
	windoww = window_create();
	
	// Setup the window handlers
	window_set_window_handlers(windoww, (WindowHandlers) {
		.load = window_load2,
		.unload = window_unload2,
	});
	
	window_stack_push(windoww, true /* Animated */);
	
}