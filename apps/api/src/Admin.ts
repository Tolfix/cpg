require("dotenv").config();
import "./Mods/Map.mod";
import "./Mods/Number.mod";
import "./Mods/String.mod";

import "./Database/Mongo";

import "./Events/Node.events";
import './Handlers/Commands.handler';
import AdminHandler from "./Admin/AdminHandler";
new AdminHandler();