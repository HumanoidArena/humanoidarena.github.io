/**
 * Entry point. Loaded as a module from `index.html`, so it runs after the DOM is
 * parsed and in source order — the ordering below is the dependency order.
 */

import { renderPage } from "./content.js";
import { startMedia } from "./media.js";
import { startNavigation } from "./nav.js";
import { startLeaderboard } from "./leaderboard.js";

renderPage(); // everything below binds to markup this creates
startMedia();
startNavigation();
startLeaderboard();
