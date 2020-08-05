// #package js/main

// dirpos -> direction/position
class LightDefinition {
    constructor(type, dirpos, enabled) {
        this.type = type;
        this.light = dirpos;
        this.enabled = enabled;
    }

    isEnabled() {
        return this.enabled;
    }

    hasChanged(oldDefinition) {
        // console.log("old:", oldDefinition, "new", this)
        if (!oldDefinition)
            return true;
        return this.type !== oldDefinition.type
            || this.light[0] !== oldDefinition.light[0]
            || this.light[1] !== oldDefinition.light[1]
            || this.light[2] !== oldDefinition.light[2]
            || this.enabled !== oldDefinition.enabled
    }
}