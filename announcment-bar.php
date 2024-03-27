<?php

/**
 * Plugin Name: Announcement Bar
 * Plugin URI: https://github.com/aronikakume1211/announcement-bar.git
 * Description: A companion plugin for a WordPress Developer Blog article.
 * Version: 1.0.0
 * Requires at least: 6.1
 * Requires PHP: 7.4
 * Author: Mebratu Kumera
 * Author URI: https://www.hullemgebeya.com/
 * License: GPLv2 or later
 * License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * Text Domain: announcement-bar
 *
 * @package unadorned-announcement-bar
 */

function announcmetn_bar_settings_page()
{
    add_options_page(
        __('Announcement Bar Settings', 'announcement-bar'),
        __('Announcement Bar', 'announcement-bar'),
        'manage_options',
        'announcement-bar-settings',
        'announcmetn_bar_settings_page_html'
    );
}

function announcmetn_bar_settings_page_html()
{
    printf(
        '<div class="wrap" id="announcement-bar-settings">%s</div>',
        esc_html__('Loading...', 'announcement-bar')
    );
}


add_action('admin_menu', 'announcmetn_bar_settings_page');

// Enqueuing script
function annuncment_bar_settings_page_script($admin_page)
{
    if ('settings_page_announcement-bar-settings' !== $admin_page) {
        return;
    }
    $asset_file = plugin_dir_path(__FILE__) . 'build/index.asset.php';
    if (!file_exists($asset_file)) {
        return;
    }
    $asset = include $asset_file;

    wp_enqueue_Script(
        'announcement-bar-script',
        plugins_url('build/index.js', __FILE__),
        $asset['dependencies'],
        $asset['version'],
        ["wp", "i18n"],
        array(
            'in_footer' => true
        )

    );

    wp_enqueue_style(
        'announcement-bar-style',
        plugins_url('build/index.css', __FILE__),
        array_filter(
            $asset['dependencies'],
            function($style){
                return wp_style_is($style, 'registered');
            }
        ),
        $asset['version'],
    );

    wp_enqueue_style('wp-components');
}

add_action('admin_enqueue_scripts', 'annuncment_bar_settings_page_script');


function announcement_bar_settings()
{
    $default = array(
        'message' => __('Hello, World', 'announcement-bar'),
        'display' => true,
        'size' => 'medium'
    );

    $schema = array(
        'type' => 'object',
        'properties' => array(
            'message' => array(
                'type' => 'string'
            ),
            'display' => array(
                'type' => 'boolean'
            ),
            'size' => array(
                'type' => 'string',
                'enum' => array(
                    'small',
                    'medium',
                    'large',
                    'x-large'
                ),
            ),
        ),
    );

    register_setting(
        'options',
        'announcement_bar',
        array(
            'type' => 'object',
            'default' => $default,
            'show_in_rest' => array(
                'schema' => $schema
            ),
        )
    );
}

add_action('rest_api_init', 'announcement_bar_settings');
add_action('after_setup_theme', 'announcement_bar_settings');

// Displaying the announcement bar on the fron end
function announcement_bar_front_page()
{
    $options = get_option('announcement_bar');
    if (!$options['display']) {
        return;
    }
    $css = WP_Style_Engine::compile_css(
        array(
            'background' => 'var(--wp--preset--color--vivid-purple, #9b51e0)',
            'color'      => 'var(--wp--preset--color--white, #ffffff)',
            'padding'    => 'var(--wp--preset--spacing--20, 1.5rem)',
            'font-size'  => $options['size'],
        ),
        ''
    );

    printf(
        '<div style="%s">%s</div>',
        esc_attr($css),
        esc_html($options['message'])
    );
}

add_action('wp_body_open', 'announcement_bar_front_page');
