// var context = new (window.AudioContext || window.webkitAudioContext)();
// var osc = context.createOscillator(); // instantiate an oscillator
// osc.type = 'sine'; // this is the default - also square, sawtooth, triangle
// osc.frequency.value = 440;
// var vol = context.createGain();
// vol.gain.value = 0; // from 0 to 1, 1 full volume, 0 is muted
// osc.connect(vol); // connect osc to vol
// vol.connect(context.destination); // connect vol to context destination
// osc.start(context.currentTime + 3);
// osc.stop(context.currentTime + 2);

var context;
var osc;
var vol;
let current_volume = 1.0;
let playing_sound = true;
let nos = [];
let lower_bound = 0.0;
let upper_bound = 1.0;
const STEPS = 20;
let steps_performed = 0;
let current_freq_index = 0;
let confirmation = false;
let initialized_sound = false;

let yes_button;
let no_button;
let audio_sign;

let table = [[], []];

import Chart from 'chart.js/auto'

const getRandomValue = () => {
    return Math.floor(Math.random() * 100);
}

var chart;

const frequencies = [
        40, 60, 100, 200, 250,
        300, 400, 500, 600, 800,
        1000, 1200, 2000, 2500, 3000,
        3500, 4000, 4500, 5000, 5500,
        6000, 7000, 8000, 9000, 10000,
        11000, 12000, 14000, 15000, 18000
];

var thresholds = Array(30).fill(decibel(0.5));
var amplitudes = Array(30).fill(0.5);

// var thresholds = Array(30).fill().map(getRandomValue);

// document.getElementById('modify').addEventListener('click', function () {
//     update_chart(Array(30).fill().map(getRandomValue));
// });

window.addEventListener('load', function () {
    console.log('loaded');
    document.getElementById('yes').addEventListener('click', yes_event);
    document.getElementById('no').addEventListener('click', no_event);
    audio_sign = document.getElementById('dot');
    // Generate table
    let table_row = document.createElement('tr');
    let table_data = document.createElement('td');
    let table_body = document.getElementById('table_body');
    for (let i = 0; i < 30; i++) {
        let current_table_row = table_row.cloneNode();
        let current_table_data1 = table_data.cloneNode();
        current_table_data1.textContent = frequencies[i];
        let current_table_data2 = table_data.cloneNode();
        current_table_data2.textContent = Math.round(thresholds[i] * 1000) / 1000;
        current_table_row.appendChild(current_table_data1);
        current_table_row.appendChild(current_table_data2);
        table_body.appendChild(current_table_row);
        table[0].push(current_table_data1);
        table[1].push(current_table_data2);
    };
});

window.addEventListener('beforeunload', function () {
    osc.stop();
});

document.getElementById('start').addEventListener('click', function (e) {
    e.target.style.display = 'none';
    // e.button.style.display = 'none';
    if (!initialized_sound) {
        context = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 128000, latencyHint: 'interactive' });
        osc = context.createOscillator(); // instantiate an oscillator
        osc.type = 'sine'; // this is the default - also square, sawtooth, triangle
        osc.frequency.value = frequencies[current_freq_index];
        vol = context.createGain();
        vol.gain.value = 0; // from 0 to 1, 1 full volume, 0 is muted
        osc.connect(vol); // connect osc to vol
        vol.connect(context.destination); // connect vol to context destination
        osc.start(context.currentTime);
        initialized_sound = true;
        play_sound(current_volume);
    } else {
        play_sound(current_volume);
    };
});

function play_sound(volume) {
    playing_sound = true;
    audio_sign.style.setProperty('background-color', 'lime');
    vol.gain.setValueAtTime(0.00001, context.currentTime); 
    vol.gain.exponentialRampToValueAtTime(volume, context.currentTime + 0.1);
    window.setTimeout(function () {
        vol.gain.setValueAtTime(vol.gain.value, context.currentTime); 
        vol.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.1);
        playing_sound = false;
        audio_sign.style.setProperty('background-color', 'red');
    }, 800);
};

function yes_event() {
    if (playing_sound) {
        return;
    };
    if (confirmation) {
        confirmation = false;
    };
    upper_bound = amplitudes[current_freq_index];
    update_threshold();
    if (steps_performed < STEPS) {
        play_sound(amplitudes[current_freq_index]);
    } else {
        // Move onto the next frequency
        next_frequency();
    };
};

function no_event() {
    if (playing_sound) {
        return;
    };
    // nos.push(amplitudes[current_freq_index]);
    if (confirmation) {
        confirmation = false;
        lower_bound = amplitudes[current_freq_index];
        update_threshold();
        if (steps_performed < STEPS) {
            play_sound(amplitudes[current_freq_index]);
        } else {
            // Move onto the next frequency
            next_frequency();
        };
    } else {
        confirmation = true;
        play_sound(amplitudes[current_freq_index]);
    };
};

function update_threshold() {
    amplitudes[current_freq_index] = (upper_bound + lower_bound) / 2;
    thresholds[current_freq_index] = decibel(amplitudes[current_freq_index]);
    console.log(amplitudes[current_freq_index]);
    steps_performed += 1;
    table[1][current_freq_index].textContent = Math.round(thresholds[current_freq_index] * 1000) / 1000;
    update_chart(thresholds);
};

function next_frequency() {
    current_freq_index += 1;
    if (current_freq_index == 30) {

    };
    steps_performed = 0;
    osc.frequency.value = frequencies[current_freq_index];
    lower_bound = 0.0;
    upper_bound = 1.0;
    play_sound(amplitudes[current_freq_index]);
};

function decibel(level) {
    return 20 * Math.log10(level);
};

function amplitude(decibel) {
    return Math.pow(10, decibel/20);
};

// document.getElementById('slider').addEventListener('input', function () {
//     vol.gain.value = this.value / 100.0;
// });

function update_chart(data) {
    chart.data.datasets[0].data = data;
    chart.update();
    console.log('updated');
};

(async function() {
    chart = new Chart(
        document.getElementById('graph'),
        {
            type: 'line',
            data: {
                // labels: data.map(row => row.year),
                labels: frequencies,
                datasets: [{
                    // label: 'My First Dataset',
                    // data: [65, 59, 80, 81, 56, 55, 40],
                    data: thresholds,
                    fill: false,
                    borderColor: 'rgb(0, 0, 0)',
                    tension: 0.2
                }]
            },
            options: {
                devicePixelRatio: 2,
                responsive: true,
                scales: {
                    x: {
                        // type: 'logarithmic',
                        title: {
                            color: 'rgb(0, 0, 0)',
                            font: {
                                size: 14,
                                weight: 'bold'
                            },
                            display: true,
                            text: 'Frequency (Hz)'
                        },
                        ticks: {
                            color: 'rgb(0, 0, 0)',
                            font: {
                                size: 14
                            },
                        }
                        // clip: true
                    },
                    y: {
                        // type: 'logarithmic',
                        title: {
                            color: 'rgb(0, 0, 0)',
                            font: {
                                size: 14,
                                weight: 'bold'
                            },
                            display: true,
                            text: 'Loudness Detection Threshold (dBFS)'
                        },
                        ticks: {
                            color: 'rgb(0, 0, 0)',
                            font: {
                                size: 14
                            },
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        displayColors: false,
                        position: 'nearest',
                        callbacks: {
                            label: function(tooltipItem) {
                                return Math.round(tooltipItem.parsed.y * 1000) / 1000 + ' dBFS';
                            },
                            title: function(tooltipItems) {
                                return tooltipItems[0].parsed.x + ' Hz';
                            }
                        }
                    }
                }
            }
        }
    );
})();
