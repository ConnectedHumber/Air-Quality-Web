<?php

namespace AirQuality\Actions;

interface IAction {
    public function handle() : boolean;
}
