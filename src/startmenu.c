#include "startmenu.h"
#include "stationmenu.h"
#include "menu_handlers.h"

GBitmap* startUpImage;
BitmapLayer *start_layer;

Window *startmenu_window;
MenuLayer *startmenu_layer;
int startmenu_callback_key = STARTMENU_CALLBACK;

bool startscreen_removed = false;


void send_appmessage(int index) {
	Tuplet value = TupletInteger(1, index);
	
	DictionaryIterator *iter;
	app_message_outbox_begin(&iter);
	
	if (iter == NULL) {
		return;
	}
	
	dict_write_tuplet(iter, &value);
	dict_write_end(iter);
	
	app_message_outbox_send();
}

void startmenu_select_callback(MenuLayer *menu_layer, MenuIndex *cell_index, void *data) {
	nr_ride_variable = 0;
	station_variable = cell_index->row;
	send_appmessage(cell_index->row);
	create_stationmenu();
}

void remove_startscreen() {
	menu_layer_reload_data(startmenu_layer);
	if(!startscreen_removed) {
		startscreen_removed = true;
		bitmap_layer_destroy(start_layer);
		gbitmap_destroy(startUpImage);
	}
	menu_layer_set_click_config_onto_window(startmenu_layer, startmenu_window);
	loaded_rows = 0;
}


void startmenu_window_load(Window *window) {
	Layer *window_layer = window_get_root_layer(window);
	GRect bounds = layer_get_frame(window_layer);
	
	startmenu_layer = menu_layer_create(bounds);
	
	menu_layer_set_callbacks(startmenu_layer, &startmenu_callback_key, (MenuLayerCallbacks){
		.get_num_sections = menu_get_num_sections_callback,
		.get_num_rows = menu_get_num_rows_callback,
		.get_header_height = menu_get_header_height_callback,
		.draw_header = menu_draw_header_callback,
		.draw_row = menu_draw_row_callback,
		.select_click = startmenu_select_callback,
	});
	
	startUpImage = gbitmap_create_with_resource(RESOURCE_ID_SLEBBLE_START_BLACK);
	start_layer = bitmap_layer_create(bounds);
	bitmap_layer_set_background_color(start_layer, GColorWhite);
	bitmap_layer_set_bitmap(start_layer, startUpImage);
	
	layer_add_child(window_layer, menu_layer_get_layer(startmenu_layer));
	layer_add_child(window_layer, bitmap_layer_get_layer(start_layer));
	
}

void startmenu_window_unload(Window *window) {
	window_stack_remove(window, true);
	window_destroy(window);
	menu_layer_destroy(startmenu_layer);
	linkedlist_release(root_startmenu);
}


void create_startmenu() {
	
	startmenu_window = window_create();
	
	window_set_window_handlers(startmenu_window, (WindowHandlers) {
		.load = startmenu_window_load,
		.unload = startmenu_window_unload,
	});

	window_stack_push(startmenu_window, true);
	
}
