// Exercise 01: Variables and Functions
// Complete the functions below to calculate statistics for a collection of numbers

fn main() {
    // TODO: Create an array of numbers (at least 5 numbers)
    let numbers = [10, 25, 5, 30, 15, 20];
    
    // TODO: Call calculate_sum and store the result
    
    // TODO: Call calculate_average and store the result
    
    // TODO: Call find_min_max and destructure the result into min and max variables
    
    // TODO: Call count_above_average with the numbers and average
    
    // TODO: Print all the results in a readable format
    println!("Statistics for numbers: {:?}", numbers);
    println!();
    // Add more println! statements here
}

// TODO: Implement this function
// Calculate the sum of all numbers in the array
fn calculate_sum(numbers: &[i32]) -> i32 {
    // Hint: Use a for loop to iterate through the array
    // Hint: Use a mutable variable to accumulate the sum
    0 // Replace this with your implementation
}

// TODO: Implement this function
// Calculate the average (mean) of all numbers
fn calculate_average(numbers: &[i32]) -> f64 {
    // Hint: Use calculate_sum to get the total
    // Hint: Convert to f64 using 'as f64'
    // Hint: Divide by the length of the array
    0.0 // Replace this with your implementation
}

// TODO: Implement this function
// Find the minimum and maximum values in the array
// Returns a tuple: (min, max)
fn find_min_max(numbers: &[i32]) -> (i32, i32) {
    // Hint: Initialize min and max with the first element
    // Hint: Use a for loop to compare each element
    // Hint: Use if statements to update min and max
    (0, 0) // Replace this with your implementation
}

// TODO: Implement this function
// Count how many numbers are above the average
fn count_above_average(numbers: &[i32], average: f64) -> usize {
    // Hint: Use a mutable counter variable
    // Hint: Use a for loop to check each number
    // Hint: Convert each number to f64 for comparison
    0 // Replace this with your implementation
}
