[![Build Status](https://travis-ci.org/xdjinnx/Slebble.svg?branch=master)](https://travis-ci.org/xdjinnx/Slebble)

# Slebble

[Slebble in pebble appstore](https://apps.rebble.io/en_US/application/5320c36f53fab421d000003a)

## Screenshots

![Screenshot1](https://assets.rebble.io/144x168/filters:upscale()/r5bc0YgVTFKftp8krkO2)
![Screenshot2](https://assets.rebble.io/144x168/filters:upscale()/GTcHN9N2Re21z1iLYtdg)
![Screenshot3](https://assets.rebble.io/144x168/filters:upscale()/VObN0prEQqyITXDCzcCy)
![Screenshot4](https://assets.rebble.io/144x168/filters:upscale()/QacC5MdHQ0AU8Gx66q9K)

## Build & Install
You will need to download and install the Pebble SDK found on the [Rebble developer website](https://developer.rebble.io/developer.pebble.com/sdk/index.html). It's also recommended that you follow the instructions found on the website.

### No Pebble watch needed
There is an emulator available to use within the Pebble SDK. Instruction on how to use the emulator can be found [here](https://developer.getpebble.com/guides/publishing-tools/pebble-tool/#installing-watchapps) and how to use the settings page can be found [here](https://developer.getpebble.com/guides/pebble-apps/pebblekit-js/app-configuration/#testing-in-the-sdk-emulator).

### Gulp
Before you can build the application you need to run [gulp](http://gulpjs.com/). Gulp installation instructions can be found [here](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md).

## Formatting
This project uses [Clang-Format](http://clang.llvm.org/docs/ClangFormat.html).

The _fmt_ bash script should be used to keep consistency in the C code.

## Testing
The Slebble js is tested using the [Jest](https://facebook.github.io/jest/) testing framework. The practices we are using when testing the private functions in the Slebble js can be found [here](http://philipwalton.com/articles/how-to-unit-test-private-functions-in-javascript/).

Testing of the C code is for now absent. The framework that should be used to test the code is [cmocka](https://cmocka.org/).

## Sponsor
[![Protected by TrackJS JavaScript Error Monitoring](https://trackjs.com/assets/external/badge.gif)](https://trackjs.com/?utm_source=badges)

## License

	Copyright (C) 2014 - 2016  Peter Lundberg

	This program is free software; you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation; either version 2 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License along
	with this program; if not, write to the Free Software Foundation, Inc.,
	51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
