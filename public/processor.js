
class Processor extends AudioWorkletProcessor {
    process(inputs, outputs, parameters) {
      return true;
    }
  }
  
  registerProcessor("processor", Processor);