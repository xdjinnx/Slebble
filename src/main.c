#include "startmenu.c"

//Extern variables from menu_handlers.c
extern AppTimer *menu_load_timer;
extern char startmenu_title[5][32];
extern char stationmenu_title[5][20][32];
extern char stationmenu_subtitle[5][20][32];
extern int station_variable;
extern int nr_station_variable;
extern int nr_ride_variable;


enum SLKey {
  PATH_KEY = 0x0,
  INDEX_KEY = 0x1,
  STATION_KEY = 0x2,
  RIDE_KEY = 0x3,
  TO_KEY = 0x4,
  NR_KEY = 0x5,
};

//Extern functions from startmenu.c
void create_startmenu();
void send_appmessage(int index);
void remove_startscreen();


//Extern function from stationmenu.c
void remove_loadscreen();


static void in_received_handler(DictionaryIterator *iter, void *context) {
	
	Tuple *path_tuple = dict_find(iter, PATH_KEY);
	Tuple *index_tuple = dict_find(iter, INDEX_KEY);
	Tuple *station_tuple = dict_find(iter, STATION_KEY);
	Tuple *ride_tuple = dict_find(iter, RIDE_KEY);
	Tuple *to_tuple = dict_find(iter, TO_KEY);
	Tuple *nr_tuple = dict_find(iter, NR_KEY);
	
	switch(path_tuple->value->uint8) {
		case 1:
			//APP_LOG(APP_LOG_LEVEL_INFO, "Appmessage recived");
			memcpy(startmenu_title[index_tuple->value->uint8], station_tuple->value->cstring, station_tuple->length);
			startmenu_title[index_tuple->value->uint8][31] = '\0';
		
			nr_station_variable = nr_tuple->value->uint8;
		
			if(menu_load_timer) {
				app_timer_reschedule(menu_load_timer, 500);
			} else {
				menu_load_timer = app_timer_register(500, remove_startscreen, NULL);
			}
			break;
		case 2:
			memcpy(stationmenu_title[station_variable][index_tuple->value->uint8], ride_tuple->value->cstring, ride_tuple->length);
			stationmenu_title[station_variable][index_tuple->value->uint8][31] = '\0';
		
			memcpy(stationmenu_subtitle[station_variable][index_tuple->value->uint8], to_tuple->value->cstring, to_tuple->length);
			stationmenu_subtitle[station_variable][index_tuple->value->uint8][31] = '\0';
		
			if(nr_tuple->value->uint8 > 20)
				nr_ride_variable = 20;
			else
				nr_ride_variable = nr_tuple->value->uint8;
		
			if(menu_load_timer) {
				app_timer_reschedule(menu_load_timer, 500);
			} else {
				menu_load_timer = app_timer_register(500, remove_loadscreen, NULL);
			}
			break;
	}
	
}

int main(void) {
	
	menu_load_timer = NULL;
	
	app_message_register_inbox_received(in_received_handler);
	create_startmenu();

	app_message_open(app_message_inbox_size_maximum(), app_message_outbox_size_maximum());
	
	app_event_loop();
}
