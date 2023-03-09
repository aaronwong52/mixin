
class Processor extends AudioWorkletProcessor {
    process(inputs, outputs, parameters) {
      const output = outputs[0];
      const input = inputs[0];
      input.forEach((channel, index) => {
        for (let i = 0; i < channel.length; i++) {
          output[index][i] = channel[i];
        };
      });
      return true;
    }
  }
  
  registerProcessor("processor", Processor);