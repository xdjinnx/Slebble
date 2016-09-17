#pragma once

#include "pebble.h"
#include "../menu/menu.h"

extern bool storage_load(Menu *menu);
extern void storage_save(Menu *menu);