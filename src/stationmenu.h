#ifndef __STATIONMENU__
#define __STATIONMENU__
	
#include "pebble.h"

extern void create_stationmenu();
extern void remove_loadscreen();
extern void tick_handler(struct tm *tick_time, TimeUnits units_changed);

#endif