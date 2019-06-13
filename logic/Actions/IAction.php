<?php

namespace AirQuality\Actions;

/**
 * Interface that defines the functionality of an action that requests can be routed to.
 */
interface IAction {
    /**
     * Handles the a request for the action.
     * @return bool Whether the request was handled successfully or not.
     */
    public function handle() : bool;
}
