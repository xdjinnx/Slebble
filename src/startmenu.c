#include "stationmenu.c"

static GBitmap* startUpImage;
static BitmapLayer *start_layer;

static Window *window;
static MenuLayer *startmenu_layer;


//Extern variables from menu_handlers.c
extern char startmenu_title[5][32];
extern int callback_variable1;
extern int station_variable;
extern int nr_station_variable;
extern int loaded_rows;


//Extern function from stationmenu.c
static void create_stationmenu();


//Extern function from menu_handlers.c
static uint16_t menu_get_num_sections_callback(MenuLayer *menu_layer, void *data);
static uint16_t menu_get_num_rows_callback(MenuLayer *menu_layer, uint16_t section_index, void *data);
static int16_t menu_get_header_height_callback(MenuLayer *menu_layer, uint16_t section_index, void *data);
static void menu_draw_header_callback(GContext* ctx, const Layer *cell_layer, uint16_t section_index, void *data);
static void menu_draw_row_callback(GContext* ctx, const Layer *cell_layer, MenuIndex *cell_index, void *data);


static void send_appmessage(int index) {
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

static void startmenu_select_callback(MenuLayer *menu_layer, MenuIndex *cell_index, void *data) {
	//APP_LOG(APP_LOG_LEVEL_INFO, "Selected: %d", cell_index->row);
	nr_ride_variable = 0;
	station_variable = cell_index->row;
	send_appmessage(cell_index->row);
	create_stationmenu();
}

static void remove_startscreen() {
	menu_layer_reload_data(startmenu_layer);
	bitmap_layer_destroy(start_layer);
	gbitmap_destroy(startUpImage);
	menu_layer_set_click_config_onto_window(startmenu_layer, window);
	loaded_rows = 0;
}


static void window_load(Window *window) {
	Layer *window_layer = window_get_root_layer(window);
	GRect bounds = layer_get_frame(window_layer);
	
	startmenu_layer = menu_layer_create(bounds);
	
	menu_layer_set_callbacks(startmenu_layer, &callback_variable1, (MenuLayerCallbacks){
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
	
	
	for(int i = 0; i < 5; i++) {
		char *temp = "";
		memcpy(startmenu_title[i], temp, 1);
	}
	
}

static void window_unload(Window *window) {
	window_stack_remove(window, true);
	window_destroy(window);
	menu_layer_destroy(startmenu_layer);
}


static void create_startmenu() {
	
	window = window_create();
	
	window_set_window_handlers(window, (WindowHandlers) {
		.load = window_load,
		.unload = window_unload,
	});

	window_stack_push(window, true /* Animated */);
	
}
