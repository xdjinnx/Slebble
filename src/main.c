#include "menu_handlers.h"
#include "stationmenu.h"
#include "startmenu.h"

enum SLKey {
  PATH_KEY = 0x0,
  INDEX_KEY = 0x1,
  STATION_KEY = 0x2,
  RIDE_KEY = 0x3,
  TO_KEY = 0x4,
  NR_KEY = 0x5,
  MIN_KEY = 0x6,
  ERROR_TITLE_KEY = 0x7,
  ERROR_SUBTITLE_KEY = 0x8,
};


void in_dropped_handler(AppMessageResult reason, void *context) {
	//APP_LOG(APP_LOG_LEVEL_WARNING, "DROPPED PACKAGE");
}


void in_received_handler(DictionaryIterator *iter, void *context) {
	
	Tuple *path_tuple = dict_find(iter, PATH_KEY);
	Tuple *index_tuple = dict_find(iter, INDEX_KEY);
	Tuple *station_tuple = dict_find(iter, STATION_KEY);
	Tuple *ride_tuple = dict_find(iter, RIDE_KEY);
	Tuple *to_tuple = dict_find(iter, TO_KEY);
	Tuple *nr_tuple = dict_find(iter, NR_KEY);
	Tuple *min_tuple = dict_find(iter, MIN_KEY);
	Tuple *error_title_tuple = dict_find(iter, ERROR_TITLE_KEY);
	Tuple *error_subtitle_tuple = dict_find(iter, ERROR_SUBTITLE_KEY);
	
	switch(path_tuple->value->uint8) {
		//Receive stations
		case 1:
			//APP_LOG(APP_LOG_LEVEL_INFO, "Appmessage recived");
			memcpy(startmenu_title[index_tuple->value->uint8], station_tuple->value->cstring, station_tuple->length);
			startmenu_title[index_tuple->value->uint8][31] = '\0';
		
			nr_station_variable = nr_tuple->value->uint8;
		
			loaded_rows++;
		
			//APP_LOG(APP_LOG_LEVEL_INFO, "Startmenu: number of rows %d of %d", loaded_rows, nr_station_variable);
			if(loaded_rows == nr_station_variable)
				remove_startscreen();
			break;
		//Receive depatures
		case 2:
			memcpy(stationmenu_title[station_variable][index_tuple->value->uint8], ride_tuple->value->cstring, ride_tuple->length);
			stationmenu_title[station_variable][index_tuple->value->uint8][31] = '\0';
		
			memcpy(stationmenu_subtitle[station_variable][index_tuple->value->uint8], to_tuple->value->cstring, to_tuple->length);
			stationmenu_subtitle[station_variable][index_tuple->value->uint8][31] = '\0';
		
			stationmenu_minLeft[station_variable][index_tuple->value->uint8] = min_tuple->value->uint8;
		
			nr_ride_variable = nr_tuple->value->uint8;
	
			loaded_rows++;
		
			//APP_LOG(APP_LOG_LEVEL_INFO, "Station: number of rows %d of %d", loaded_rows, nr_ride_variable);
			if(loaded_rows == nr_ride_variable)
				remove_loadscreen();
			break;
		//Receive Error message in depature screen
		case 3:
			memcpy(stationmenu_title[station_variable][0], error_title_tuple->value->cstring, error_title_tuple->length);
			stationmenu_title[station_variable][0][31] = '\0';
		
			memcpy(stationmenu_subtitle[station_variable][0], error_subtitle_tuple->value->cstring, error_subtitle_tuple->length);
			stationmenu_subtitle[station_variable][0][31] = '\0';
		
			stationmenu_minLeft[station_variable][0] = -1;
			nr_ride_variable = 1;
		
			remove_loadscreen();
			
			break;
	}
	
}

int main(void) {
	app_message_register_inbox_received(in_received_handler);
	app_message_register_inbox_dropped(in_dropped_handler);
	create_startmenu();
	tick_timer_service_subscribe(MINUTE_UNIT, tick_handler);

	app_message_open(app_message_inbox_size_maximum(), app_message_outbox_size_maximum());
	
	app_event_loop();
}
