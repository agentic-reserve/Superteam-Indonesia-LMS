// Exercise 01: Variables and Functions - Reference Solution
// This solution demonstrates proper use of variables, functions, and control flow

fn main() {
    // Create an array of numbers
    let numbers = [10, 25, 5, 30, 15, 20];
    
    // Calculate sum
    let sum = calculate_sum(&numbers);
    
    // Calculate average
    let average = calculate_average(&numbers);
    
    // Find min and max
    let (min, max) = find_min_max(&numbers);
    
    // Count numbers above average
    let above_average_count = count_above_average(&numbers, average);
    
    // Display results
    println!("Statistics for numbers: {:?}", numbers);
    println!();
    println!("Sum: {}", sum);
    println!("Average: {:.1}", average);
    println!("Minimum: {}", min);
    println!("Maximum: {}", max);
    println!("Numbers above average: {}", above_average_count);
}

// Calculate the sum of all numbers in the array
fn calculate_sum(numbers: &[i32]) -> i32 {
    let mut sum = 0;
    
    for number in numbers {
        sum += number;
    }
    
    sum
}

// Calculate the average (mean) of all numbers
fn calculate_average(numbers: &[i32]) -> f64 {
    let sum = calculate_sum(numbers);
    let count = numbers.len();
    
    // Convert to f64 for floating-point division
    sum as f64 / count as f64
}

// Find the minimum and maximum values in the array
// Returns a tuple: (min, max)
fn find_min_max(numbers: &[i32]) -> (i32, i32) {
    // Initialize with the first element
    let mut min = numbers[0];
    let mut max = numbers[0];
    
    // Iterate through all numbers
    for &number in numbers {
        if number < min {
            min = number;
        }
        if number > max {
            max = number;
        }
    }
    
    (min, max)
}

// Count how many numbers are above the average
fn count_above_average(numbers: &[i32], average: f64) -> usize {
    let mut count = 0;
    
    for &number in numbers {
        // Convert to f64 for comparison with average
        if number as f64 > average {
            count += 1;
        }
    }
    
    count
}
