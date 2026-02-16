import fc from 'fast-check';

console.log('Testing fast-check...');

const property = fc.property(
  fc.integer(1, 10),
  (n) => {
    console.log(`Testing with: ${n}`);
    return n > 0;
  }
);

fc.assert(property, { numRuns: 5 });
console.log('Test passed!');
