#include "menu_handlers.c"
	
static GBitmap* loadImage;
static BitmapLayer *loading_layer;

static Window* windoww;
static MenuLayer *stationmenu_layer;

//Extern variables from menu_handlers.c
extern char stationmenu_title[5][20][32];
extern char stationmenu_subtitle[5][20][32];
extern int station_variable;
extern int callback_variable2;
extern AppTimer *menu_load_timer;

//Extern function from menu_handlers.c
static uint16_t menu_get_num_sections_callback(MenuLayer *menu_layer, void *data);
static uint16_t menu_get_num_rows_callback(MenuLayer *menu_layer, uint16_t section_index, void *data);
static int16_t menu_get_header_height_callback(MenuLayer *menu_layer, uint16_t section_index, void *data);
static void menu_draw_header_callback(GContext* ctx, const Layer *cell_layer, uint16_t section_index, void *data);
static void menu_draw_row_callback(GContext* ctx, const Layer *cell_layer, MenuIndex *cell_index, void *data);


static void stationmenu_select_callback(MenuLayer *menu_layer, MenuIndex *cell_index, void *data){}


static void remove_loadscreen() {
	menu_layer_reload_data(stationmenu_layer);
	menu_load_timer = NULL;
	bitmap_layer_destroy(loading_layer);
	gbitmap_destroy(loadImage);
	menu_layer_set_click_config_onto_window(stationmenu_layer, windoww);
}


static void window_load2(Window *window) {
	
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

static void window_unload2(Window *window) {
	window_stack_remove(window, true);
	window_destroy(window);
	menu_layer_destroy(stationmenu_layer);
}


static void create_stationmenu() {
	windoww = window_create();
	
	// Setup the window handlers
	window_set_window_handlers(windoww, (WindowHandlers) {
		.load = window_load2,
		.unload = window_unload2,
	});
	
	window_stack_push(windoww, true /* Animated */);
	
}