#ifndef __STATIONMENU__
#define __STATIONMENU__
	
#include "pebble.h"

void create_stationmenu();
void remove_loadscreen();
void tick_handler(struct tm *tick_time, TimeUnits units_changed);

#endif