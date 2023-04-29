# tswow-plots

This is a simple library used to plot numeric values into graphs in TSWoW.

## File Structure

- datascripts/
    - [example_basic.ts](datascripts/example_basic.ts)
        - Illustrates how to use the library
    - [example_experience.ts](datascripts/example_experience.ts)
        - More advanced example for reading experience data
    - [plot.ts](datascripts/plots.ts)
        - The core of this library. You can just copy this file into your own module if you don't want to install this module.

Plots are saved the file `plots.html` inside your tswow installation directory. You can open this file in any browser.

## Problems

The plotting page is slightly off for smaller screens, but should look alright on bigger screens.