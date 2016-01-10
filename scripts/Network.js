//
// Abstractions over common network methods
//

(function(scope){
    if (!$){
        throw "Unable to find required type '$'.";
    }
    
    if (!scope.Network){
        scope.Network = {};
    }
})(this);