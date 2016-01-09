//
// The time checker logic itself, removed from 
// and DOM stuffs.
//

(function(scope){
    // Make sure our object doesn't already exist
    // before defining it.
    if (!scope.TimeChecker){
        scope.TimeChecker = function(){
            var self = this;
            
            self.OnNextResult = null;
            self.OnComplete = null;
            
            self.Start = function(){
                if (self.OnNextResult){
                    self.OnNextResult();
                }
                
                if (self.OnComplete){
                    self.OnComplete();
                }
            };       
        };
    }
})(this);